import { toISODate } from './dates.mjs';

// Markup and stylesheet bytes come mostly from exported templates, so they are left out.
export const DEFAULT_EXCLUDED_LANGUAGES = ['HTML', 'CSS', 'SCSS', 'Sass', 'Less'];

const DAY = 86400000;

// Every day GitHub reports, as { date, count }. Weeks start on Sunday at 00:00 UTC.
function* commitDays(repos) {
  for (const repo of repos) {
    for (const week of repo.weeks ?? []) {
      for (let i = 0; i < week.days.length; i += 1) {
        if (week.days[i] > 0) yield { date: toISODate(new Date(week.week * 1000 + i * DAY)), count: week.days[i] };
      }
    }
  }
}

export function monthKeys(today, count = 12) {
  const [year, month] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => new Date(Date.UTC(year, month - count + i, 1)).toISOString().slice(0, 7));
}

// The last `count` calendar months, the current one to date.
export function monthlyCommits(repos, today, count = 12) {
  const keys = monthKeys(today, count);
  const totals = new Map(keys.map((key) => [key, 0]));
  const start = `${keys[0]}-01`;
  for (const { date, count: n } of commitDays(repos)) {
    if (date < start || date > today) continue;
    totals.set(date.slice(0, 7), totals.get(date.slice(0, 7)) + n);
  }
  return keys.map((month) => ({ month, count: totals.get(month) }));
}

// Repositories with at least one commit in each of the last `count` calendar months.
export function activeReposByMonth(repos, today, count = 12) {
  const keys = monthKeys(today, count);
  const totals = new Map(keys.map((key) => [key, 0]));
  const start = `${keys[0]}-01`;
  for (const repo of repos) {
    const months = new Set();
    for (const { date } of commitDays([repo])) if (date >= start && date <= today) months.add(date.slice(0, 7));
    for (const month of months) totals.set(month, totals.get(month) + 1);
  }
  return keys.map((month) => ({ month, count: totals.get(month) }));
}

export function repoCounts(repos, now) {
  const within = (iso, days) => Boolean(iso) && now.getTime() - Date.parse(iso) <= days * DAY;
  return {
    total: repos.length,
    private: repos.filter((r) => r.private).length,
    public: repos.filter((r) => !r.private).length,
    active12m: repos.filter((r) => (r.weeks ?? []).some((w) => w.days.some((n) => n > 0))).length,
    active30d: repos.filter((r) => within(r.pushedAt, 30)).length,
    created12m: repos.filter((r) => within(r.createdAt, 365)).length,
  };
}

export function roundToTotal(values, total = 100, decimals = 1) {
  const factor = 10 ** decimals;
  const scaled = values.map((v) => v * factor);
  const floors = scaled.map((v) => Math.floor(v));
  let missing = Math.round(total * factor) - floors.reduce((a, b) => a + b, 0);
  const order = scaled.map((v, i) => [v - floors[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (missing <= 0) break;
    floors[i] += 1;
    missing -= 1;
  }
  return floors.map((v) => v / factor);
}

export function languageMix(repos, { exclude = DEFAULT_EXCLUDED_LANGUAGES, top = 6 } = {}) {
  const skip = new Set(exclude);
  const bytes = new Map();
  for (const repo of repos) {
    for (const [name, n] of Object.entries(repo.languages ?? {})) {
      if (!skip.has(name) && n > 0) bytes.set(name, (bytes.get(name) ?? 0) + n);
    }
  }
  const sum = [...bytes.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];
  const ranked = [...bytes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const rest = ranked.slice(top).reduce((a, [, v]) => a + v, 0);
  const entries = rest > 0 ? [...ranked.slice(0, top), ['Other', rest]] : ranked.slice(0, top);
  const percents = roundToTotal(entries.map(([, v]) => (v / sum) * 100));
  return entries.map(([name], i) => ({ name, percent: percents[i] })).filter((entry) => entry.percent > 0);
}

export function summarize(raw, now) {
  const today = toISODate(now);
  const months = monthlyCommits(raw.repos, today);
  return {
    repos: repoCounts(raw.repos, now),
    commits: { last12m: months.reduce((sum, m) => sum + m.count, 0), months },
    activeRepos: activeReposByMonth(raw.repos, today),
    languages: languageMix(raw.repos),
    excluded: DEFAULT_EXCLUDED_LANGUAGES,
  };
}
