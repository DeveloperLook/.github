import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createGitHub } from './lib/github.mjs';
import { collectOrg } from './lib/collect.mjs';
import { summarize } from './lib/metrics.mjs';
import { THEMES } from './lib/theme.mjs';
import { renderOverview } from './lib/charts/overview.mjs';
import { renderActivity } from './lib/charts/activity.mjs';
import { renderCadence } from './lib/charts/cadence.mjs';
import { renderLanguages } from './lib/charts/languages.mjs';
import { renderStatsMarkdown } from './lib/table.mjs';

export const CHARTS = { overview: renderOverview, activity: renderActivity, cadence: renderCadence, languages: renderLanguages };

// Logs carry counts only: GitHub Actions logs on a public repository are public.
export async function buildStats({ org, gh, previous = null, now = new Date(), log = () => {}, sleep }) {
  if (!gh) {
    if (!previous) throw new Error('No ORG_STATS_TOKEN and no snapshot to fall back on');
    log(`no ORG_STATS_TOKEN: rendering the snapshot from ${previous.generatedAt.slice(0, 10)}`);
    return previous;
  }
  let raw;
  try {
    raw = await collectOrg(gh, org, sleep ? { sleep } : {});
  } catch (error) {
    if (!previous) throw error;
    log(`warning: org stats unavailable (${error.message}); keeping the snapshot from ${previous.generatedAt.slice(0, 10)}`);
    return previous;
  }
  log(`collected ${raw.repos.length} repositories (${raw.pending} still computing commit statistics)`);
  const fresh = { schemaVersion: 1, generatedAt: now.toISOString(), org, ...summarize(raw, now) };
  if (previous) {
    // A token that cannot read private repositories sees only the public ones, which would shrink every number.
    if (fresh.repos.total < previous.repos.total / 2) {
      log(`warning: fresh stats cover ${fresh.repos.total} repositories, fewer than half of the previous ${previous.repos.total}; keeping the snapshot`);
      return previous;
    }
    if (raw.pending > raw.repos.length / 10) {
      log(`warning: GitHub is still computing commit statistics for ${raw.pending} repositories; keeping the snapshot`);
      return previous;
    }
  }
  return fresh;
}

export function renderAll(stats) {
  const files = {};
  for (const [name, render] of Object.entries(CHARTS)) {
    for (const theme of Object.values(THEMES)) files[`${name}-${theme.name}.svg`] = render(stats, theme);
  }
  files['stats.json'] = `${JSON.stringify(stats, null, 2)}\n`;
  files['stats.md'] = renderStatsMarkdown(stats);
  return files;
}

export function ghCliToken() {
  const result = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() || undefined : undefined;
}

// The built-in Actions token only sees this repository, so it is never used for org stats.
export function resolveToken(env, ghToken = ghCliToken) {
  return env.ORG_STATS_TOKEN || (env.CI ? undefined : ghToken());
}

const isCount = (n) => Number.isInteger(n) && n >= 0;
const isSeries = (list, key) => Array.isArray(list) && list.length > 0 && list.every((item) => item !== null && typeof item === 'object' && typeof item[key] === 'string' && isCount(item.count));

// Snapshots live on a public branch and can be edited by hand; render one only when it is intact.
export function validStats(stats) {
  if (stats === null || typeof stats !== 'object' || stats.schemaVersion !== 1) return null;
  const { repos, commits, activeRepos, languages, excluded } = stats;
  const intact =
    typeof stats.generatedAt === 'string' &&
    !Number.isNaN(Date.parse(stats.generatedAt)) &&
    repos !== null &&
    typeof repos === 'object' &&
    ['total', 'private', 'public', 'active12m', 'active30d', 'created12m'].every((key) => isCount(repos[key])) &&
    commits !== null &&
    typeof commits === 'object' &&
    isCount(commits.last12m) &&
    isSeries(commits.months, 'month') &&
    isSeries(activeRepos, 'month') &&
    Array.isArray(languages) &&
    languages.every((l) => l !== null && typeof l === 'object' && typeof l.name === 'string' && Number.isFinite(l.percent)) &&
    Array.isArray(excluded) &&
    excluded.every((name) => typeof name === 'string');
  return intact ? stats : null;
}

export async function readSnapshot(...paths) {
  for (const path of paths.filter(Boolean)) {
    try {
      const stats = validStats(JSON.parse(await readFile(path, 'utf8')));
      if (stats) return stats;
    } catch {
      // Missing or unreadable: try the next one.
    }
  }
  return null;
}

export async function main(argv = process.argv.slice(2), env = process.env, deps = {}) {
  const { fetchImpl = globalThis.fetch, ghToken = ghCliToken, log = (m) => console.log(`org-stats: ${m}`), now = new Date() } = deps;
  try {
    const { values } = parseArgs({
      args: argv,
      options: { out: { type: 'string', default: 'dist' }, previous: { type: 'string' }, seed: { type: 'string', default: 'stats/snapshot.json' }, org: { type: 'string' } },
    });
    const org = values.org ?? env.GITHUB_REPOSITORY_OWNER ?? 'DeveloperLook';
    const token = resolveToken(env, ghToken);
    const previous = await readSnapshot(values.previous, values.seed);
    const stats = await buildStats({ org, gh: token ? createGitHub({ token, fetchImpl }) : null, previous, now, log });
    const files = renderAll(stats);
    await mkdir(values.out, { recursive: true });
    for (const [name, content] of Object.entries(files)) await writeFile(join(values.out, name), content);
    log(`wrote ${Object.keys(files).length} files to ${values.out}`);
    return 0;
  } catch (error) {
    log(`error: ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
