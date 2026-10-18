import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { activeReposByMonth, languageMix, monthKeys, monthlyCommits, repoCounts, summarize } from '../lib/metrics.mjs';
import { buildStats, readSnapshot, renderAll, validStats } from '../generate.mjs';
import { loadVendor, renderStaticAssets } from '../build-assets.mjs';
import { renderReadme } from '../lib/readme.mjs';
import { SERVICES, SERVICE_CARD } from '../lib/assets/services.mjs';
import { PRODUCTS, PRODUCT_CARD } from '../lib/assets/products.mjs';
import { textWidth } from '../lib/svg.mjs';

const DAY = 86400;
// A repository with `count` commits on each listed date (weeks start on Sunday).
function repo(dates, extra = {}) {
  const weeks = new Map();
  for (const date of dates) {
    const t = Date.parse(`${date}T00:00:00Z`) / 1000;
    const day = new Date(t * 1000).getUTCDay();
    const start = t - day * DAY;
    if (!weeks.has(start)) weeks.set(start, [0, 0, 0, 0, 0, 0, 0]);
    weeks.get(start)[day] += 1;
  }
  return { private: true, createdAt: '2020-01-01T00:00:00Z', pushedAt: '2020-01-01T00:00:00Z', languages: {}, weeks: [...weeks].map(([week, days]) => ({ week, days })), ...extra };
}

test('month keys run back from the current month', () => {
  assert.deepEqual(monthKeys('2026-10-18', 3), ['2026-08', '2026-09', '2026-10']);
  assert.deepEqual(monthKeys('2026-01-05', 2), ['2025-12', '2026-01']);
});

test('commits land in the month of their day, inside the 12 month window only', () => {
  const months = monthlyCommits([repo(['2025-10-31', '2025-11-01', '2026-03-31', '2026-04-01', '2026-10-18', '2026-10-19'])], '2026-10-18');
  const byMonth = Object.fromEntries(months.map((m) => [m.month, m.count]));
  assert.equal(months.length, 12);
  assert.equal(byMonth['2025-11'], 1);
  assert.equal(byMonth['2026-03'], 1);
  assert.equal(byMonth['2026-04'], 1);
  assert.equal(byMonth['2026-10'], 1, 'today counts, tomorrow does not');
  assert.equal(months.reduce((s, m) => s + m.count, 0), 4, 'October 2025 is outside the window');
});

test('a repository counts once per month however many commits it has', () => {
  const active = activeReposByMonth([repo(['2026-10-01', '2026-10-02', '2026-10-03']), repo(['2026-10-05']), repo(['2026-09-30'])], '2026-10-18');
  assert.equal(active.at(-1).count, 2);
  assert.equal(active.at(-2).count, 1);
});

test('repository counts use push and creation dates', () => {
  const now = new Date('2026-10-18T12:00:00Z');
  const counts = repoCounts(
    [repo(['2026-10-01'], { pushedAt: '2026-10-10T00:00:00Z', createdAt: '2026-01-01T00:00:00Z' }), repo([], { private: false, weeks: null }), repo(['2026-02-01'])],
    now,
  );
  assert.deepEqual(counts, { total: 3, private: 2, public: 1, active12m: 2, active30d: 1, created12m: 1 });
});

test('languages leave out markup, roll the tail into Other and add up to 100', () => {
  const mix = languageMix(
    [{ languages: { HTML: 9000, CSS: 500, TypeScript: 600, JavaScript: 300 } }, { languages: { PHP: 50, Go: 20, Ruby: 15, Rust: 10, Lua: 5 } }],
    { top: 4 },
  );
  assert.deepEqual(mix.map((l) => l.name), ['TypeScript', 'JavaScript', 'PHP', 'Go', 'Other']);
  assert.equal(Math.round(mix.reduce((s, l) => s + l.percent, 0) * 10) / 10, 100);
});

const now = new Date('2026-10-18T12:00:00Z');
const sleep = async () => {};
const raw = { repos: [repo(['2026-10-01']), repo(['2026-05-05'], { languages: { TypeScript: 10 } })], pending: 0 };
const snapshot = { schemaVersion: 1, generatedAt: '2026-10-01T00:00:00.000Z', org: 'DeveloperLook', ...summarize({ repos: [repo(['2026-09-01'])] }, new Date('2026-10-01T00:00:00Z')) };
const fakeGh = (data) => ({
  restAll: async () => data.repos.map((r, i) => ({ full_name: `org/r${i}`, private: r.private, created_at: r.createdAt, pushed_at: r.pushedAt, fork: false })),
  rest: async (path) => {
    const i = Number(path.match(/r(\d+)/)[1]);
    if (path.endsWith('/languages')) return { status: 200, data: data.repos[i].languages };
    return data.pending > i ? { status: 202, data: {} } : { status: 200, data: data.repos[i].weeks };
  },
});

test('without a token the newest snapshot is rendered as is', async () => {
  assert.equal(await buildStats({ org: 'DeveloperLook', gh: null, previous: snapshot, now }), snapshot);
  await assert.rejects(buildStats({ org: 'DeveloperLook', gh: null, previous: null, now }), /No ORG_STATS_TOKEN/);
});

test('fresh stats replace the snapshot unless they look under-scoped or incomplete', async () => {
  const fresh = await buildStats({ org: 'DeveloperLook', gh: fakeGh(raw), previous: snapshot, now, sleep });
  assert.equal(fresh.generatedAt, now.toISOString());
  assert.equal(fresh.repos.total, 2);
  const big = { ...snapshot, repos: { ...snapshot.repos, total: 10 } };
  assert.equal(await buildStats({ org: 'DeveloperLook', gh: fakeGh(raw), previous: big, now, sleep }), big, 'fewer than half the repositories');
  const counting = { repos: raw.repos, pending: 1 };
  const kept = await buildStats({ org: 'DeveloperLook', gh: fakeGh(counting), previous: snapshot, now, sleep });
  assert.equal(kept, snapshot, 'too many repositories still computing');
});

test('stats JSON never carries repository names', async () => {
  const fresh = await buildStats({ org: 'DeveloperLook', gh: fakeGh(raw), previous: null, now, sleep });
  assert.doesNotMatch(JSON.stringify(fresh), /org\/r\d/);
});

test('hand-edited or broken snapshots are ignored', async () => {
  assert.equal(validStats(snapshot), snapshot);
  assert.equal(validStats({ ...snapshot, repos: { ...snapshot.repos, total: -1 } }), null);
  assert.equal(validStats({ ...snapshot, activeRepos: 'x' }), null);
  assert.equal(validStats({ ...snapshot, schemaVersion: 2 }), null);
  const seed = await readSnapshot('/missing/previous.json', 'stats/snapshot.json');
  assert.ok(seed, 'falls back to the committed seed');
});

test('every chart renders in both themes, with its tables', () => {
  const files = renderAll(snapshot);
  for (const name of ['overview', 'activity', 'cadence', 'languages']) {
    for (const theme of ['dark', 'light']) assert.match(files[`${name}-${theme}.svg`], /^<svg [^>]+role="img"/);
  }
  assert.match(files['stats.md'], /## Active repositories per month/);
});

const DASHES = /[–—]/;

test('static assets render, fit their cards and avoid dashes', async () => {
  const files = renderStaticAssets(await loadVendor());
  assert.equal(Object.keys(files).length, 37);
  for (const [name, svg] of Object.entries(files)) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]+><title id=/, name);
    assert.doesNotMatch(svg, DASHES, name);
    assert.doesNotMatch(svg, /<script|href="http/, name);
  }
  for (const s of SERVICES) for (const line of s.lines) assert.ok(textWidth(line, 13) <= SERVICE_CARD.textWidth, line);
  for (const p of PRODUCTS) for (const line of p.lines) assert.ok(textWidth(line, 13) <= PRODUCT_CARD.textWidth, line);
  for (const p of PRODUCTS) {
    assert.ok(textWidth(p.tagline, 12.5) <= PRODUCT_CARD.taglineWidth, p.tagline);
    const chips = p.chips.reduce((sum, chip) => sum + textWidth(chip, 11.5) + 18 + 6, -6);
    assert.ok(chips <= PRODUCT_CARD.textWidth, p.chips.join(', '));
  }
});

test('the README links every asset and chart and is in sync with the build', async () => {
  const readme = renderReadme();
  assert.equal(await readFile('profile/README.md', 'utf8'), readme, 'run npm run build:assets');
  assert.doesNotMatch(readme, DASHES);
  const assets = (await readdir('assets')).filter((f) => f.endsWith('.svg'));
  for (const file of assets) assert.ok(readme.includes(`/main/assets/${file}`), file);
  for (const name of ['overview', 'activity', 'cadence', 'languages']) for (const theme of ['dark', 'light']) assert.ok(readme.includes(`/output/${name}-${theme}.svg`), name);
  for (const img of readme.match(/<img [^>]+>/g)) assert.match(img, /alt="[^"]{3,}"/);
});

test('the workflow uses the org token for stats and pinned actions', async () => {
  const workflow = await readFile('.github/workflows/org-stats.yml', 'utf8');
  assert.match(workflow, /ORG_STATS_TOKEN: \$\{\{ secrets\.ORG_STATS_TOKEN \}\}/);
  assert.doesNotMatch(workflow.split('- name: Generate charts')[1].split('- name:')[0], /GITHUB_TOKEN/);
  for (const uses of workflow.match(/uses: \S+/g)) assert.match(uses, /@[0-9a-f]{40}$/);
});
