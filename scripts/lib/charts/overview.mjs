import { cardRect, el, fmt, svgDoc, text } from '../svg.mjs';

export function overviewTiles(stats) {
  const { repos, commits } = stats;
  return [
    { value: fmt(commits.last12m), label: 'Commits', sub: 'Last 12 months' },
    { value: fmt(repos.total), label: 'Repositories', sub: `${fmt(repos.private)} private · ${fmt(repos.public)} public` },
    { value: fmt(repos.active12m), label: 'Active repos', sub: 'Last 12 months' },
    { value: fmt(repos.active30d), label: 'Shipping now', sub: 'Pushed in 30 days' },
    { value: fmt(repos.created12m), label: 'New repos', sub: 'Last 12 months' },
  ];
}

export function renderOverview(stats, theme) {
  const width = 840;
  const height = 124;
  const tiles = overviewTiles(stats);
  const tileWidth = width / tiles.length;
  const body = tiles.map((tile, i) => {
    const x = i * tileWidth + 28;
    const divider = i ? el('line', { x1: i * tileWidth, x2: i * tileWidth, y1: 28, y2: 98, stroke: theme.grid, 'stroke-width': 1 }) : '';
    return (
      divider +
      text(x, 60, tile.value, { size: 30, weight: 600, fill: theme.text }) +
      text(x, 84, tile.label, { size: 13, fill: theme.textSecondary }) +
      text(x, 103, tile.sub, { size: 12, fill: theme.textMuted })
    );
  });
  const desc = `${tiles.map((t) => `${t.label} (${t.sub.toLowerCase()}): ${t.value}`).join('. ')}.`;
  return svgDoc({ width, height, title: 'DeveloperLook engineering overview', desc, body: cardRect(width, height, theme) + body.join('') });
}
