import { cardRect, el, svgDoc, text } from '../svg.mjs';

// The six steps and timeframes from developerlook.com/our-process.
export const STEPS = [
  { title: ['Discovery'], time: '1 week' },
  { title: ['Scope and', 'proposal'], time: '3 to 5 days' },
  { title: ['UX and UI', 'design'], time: '2 to 3 weeks' },
  { title: ['Build', 'sprints'], time: '2 weeks each' },
  { title: ['QA and', 'launch'], time: '1 week' },
  { title: ['Support and', 'growth'], time: 'Ongoing' },
];

export const PROCESS_NOTE = [
  { text: 'One project manager', strong: true },
  { text: '   ·   ' },
  { text: 'Two week sprints', strong: true },
  { text: '   ·   ' },
  { text: 'A live staging link', strong: true },
  { text: ' at the end of every sprint' },
];

export function renderProcess(theme) {
  const width = 840;
  const height = 196;
  const column = (width - 56) / STEPS.length;
  const first = 28 + 17;
  const last = 28 + (STEPS.length - 1) * column + 17;
  let body =
    '<defs><linearGradient id="track" x1="0" x2="1"><stop offset="0" stop-color="#8B65E9"/><stop offset="1" stop-color="#C98500"/></linearGradient></defs>' +
    cardRect(width, height, theme, 14) +
    el('line', { x1: first, y1: 48, x2: last, y2: 48, stroke: 'url(#track)', 'stroke-width': 2, opacity: 0.55 });
  STEPS.forEach((step, i) => {
    const x = 28 + i * column;
    body += el('circle', { cx: x + 17, cy: 48, r: 17, fill: theme.tile, stroke: theme.mark, 'stroke-width': 1.5 });
    body += text(x + 17, 52.5, String(i + 1).padStart(2, '0'), { size: 12.5, weight: 700, fill: theme.link, anchor: 'middle' });
    step.title.forEach((line, j) => {
      body += text(x, 94 + j * 18, line, { size: 14, weight: 600, fill: theme.text });
    });
    body += text(x, 94 + step.title.length * 18 + 4, step.time, { size: 12.5, fill: theme.textMuted });
  });
  body += el('line', { x1: 28, y1: 152.5, x2: 812, y2: 152.5, stroke: theme.border });
  body += el(
    'text',
    { x: 28, y: 177, 'font-size': 13, fill: theme.textSecondary, 'xml:space': 'preserve' },
    PROCESS_NOTE.map((part) => (part.strong ? el('tspan', { fill: theme.text, 'font-weight': 600 }, part.text) : part.text)).join(''),
  );
  const desc = `${STEPS.map((s, i) => `${i + 1}. ${s.title.join(' ')}: ${s.time}`).join('. ')}. One project manager, two week sprints and a live staging link at the end of every sprint.`;
  return svgDoc({ width, height, title: 'How we work', desc, body });
}
