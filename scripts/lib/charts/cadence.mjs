import { GROW_STYLE, fmt, niceScale, svgDoc, text } from '../svg.mjs';
import { monthParts } from '../dates.mjs';
import { columns, frame, peakIndex, yAxis } from './common.mjs';

export function renderCadence(stats, theme) {
  const width = 410;
  const height = 320;
  const left = 56;
  const right = 386;
  const baseline = 252;
  const plotHeight = 152;
  const months = stats.activeRepos;
  const values = months.map((m) => m.count);
  const scale = niceScale(Math.max(0, ...values), 3);
  const peak = peakIndex(values);

  let body = frame({ width, height, theme, title: 'Active repositories', subtitle: 'Repositories with commits, per month' });
  body += yAxis({ left, right, baseline, height: plotHeight, scale, theme });
  for (const bar of columns({ values, left, right, baseline, height: plotHeight, scale, theme, highlightIndex: peak, barWidth: 16 })) {
    body += bar.mark;
    if (bar.i === peak && bar.value > 0) body += text(bar.center, bar.top - 10, fmt(bar.value), { size: 13, weight: 600, fill: theme.text, anchor: 'middle' });
    body += text(bar.center, baseline + 22, monthParts(months[bar.i].month).short.slice(0, 1), { size: 12, fill: theme.textMuted, anchor: 'middle' });
  }
  if (peak >= 0) {
    const { long, year } = monthParts(months[peak].month);
    body += text(28, height - 18, `Busiest month: ${long} ${year}`, { size: 12, fill: theme.textMuted });
  }
  const desc = `Repositories with commits each month: ${months.map((m) => `${monthParts(m.month).short} ${monthParts(m.month).year} ${m.count}`).join(', ')}.`;
  return svgDoc({ width, height, title: 'Active repositories per month', desc, body, style: GROW_STYLE });
}
