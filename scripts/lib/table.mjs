import { fmt } from './svg.mjs';
import { formatDate, formatMonthYear } from './dates.mjs';
import { overviewTiles } from './charts/overview.mjs';

const cell = (value) => String(value).replaceAll('|', '\\|');

// The same numbers as the charts, as Markdown tables (README images cannot show tooltips).
export function renderStatsMarkdown(stats) {
  const lines = [
    '# DeveloperLook engineering stats',
    '',
    `Generated ${formatDate(stats.generatedAt)} from every repository in the DeveloperLook organization. Totals only: no code, project or client names.`,
    '',
    '## Overview',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    ...overviewTiles(stats).map((t) => `| ${t.label} (${t.sub.toLowerCase()}) | ${t.value} |`),
    '',
    '## Commits per month',
    '',
    '| Month | Commits |',
    '| --- | ---: |',
    ...stats.commits.months.map((m) => `| ${formatMonthYear(m.month)} | ${fmt(m.count)} |`),
    '',
    '## Active repositories per month',
    '',
    '| Month | Repositories with commits |',
    '| --- | ---: |',
    ...stats.activeRepos.map((m) => `| ${formatMonthYear(m.month)} | ${fmt(m.count)} |`),
    '',
    '## Languages',
    '',
  ];
  if (stats.languages.length) {
    lines.push(
      `Share of code across all repositories. Excluded: ${stats.excluded.join(', ')}.`,
      '',
      '| Language | Share |',
      '| --- | ---: |',
      ...stats.languages.map((l) => `| ${cell(l.name)} | ${l.percent.toFixed(1)}% |`),
    );
  } else {
    lines.push('Not available yet.');
  }
  return `${lines.join('\n')}\n`;
}
