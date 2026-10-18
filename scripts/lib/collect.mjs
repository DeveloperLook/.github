// Repository names never leave this module: the snapshot, logs and errors carry counts only,
// because Actions logs and the output branch of this public repository are public.
async function mapLimit(items, limit, task) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await task(items[next++]);
  });
  await Promise.all(workers);
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

export async function collectOrg(gh, org, { sleep = wait, concurrency = 6, rounds = 5 } = {}) {
  const repos = (await gh.restAll(`orgs/${org}/repos?type=all&per_page=100`)).filter((repo) => !repo.fork);
  const entries = repos.map((repo) => ({
    fullName: repo.full_name,
    private: Boolean(repo.private),
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    weeks: null,
    languages: {},
  }));

  await mapLimit(entries, concurrency, async (entry) => {
    const response = await gh.rest(`repos/${entry.fullName}/languages`);
    if (response.status >= 400) throw new Error(`Languages request failed with status ${response.status}`);
    entry.languages = response.data ?? {};
  });

  // GitHub answers 202 while it computes commit statistics, so ask again for those repositories.
  let pending = entries;
  for (let round = 0; round < rounds && pending.length > 0; round += 1) {
    if (round > 0) await sleep(3000 * round);
    const computing = [];
    await mapLimit(pending, concurrency, async (entry) => {
      const response = await gh.rest(`repos/${entry.fullName}/stats/commit_activity`);
      if (response.status === 202) {
        computing.push(entry);
        return;
      }
      if (response.status === 204) {
        entry.weeks = [];
        return;
      }
      if (response.status >= 400) throw new Error(`Commit activity request failed with status ${response.status}`);
      entry.weeks = (Array.isArray(response.data) ? response.data : []).map((week) => ({ week: week.week, days: week.days }));
    });
    pending = computing;
  }

  return { repos: entries.map(({ fullName, ...entry }) => entry), pending: pending.length };
}
