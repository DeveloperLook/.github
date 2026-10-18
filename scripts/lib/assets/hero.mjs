import { GROW_STYLE, el, esc, svgDoc, text } from '../svg.mjs';
import { HERO } from '../theme.mjs';
import { assertOnest, onestStyle } from '../fonts.mjs';
import { renderMark } from './mark.mjs';

export const HERO_COPY = {
  eyebrow: 'SOFTWARE DEVELOPMENT COMPANY · USA · SINCE 2018',
  line1: 'Web & mobile apps',
  line2: 'that ',
  highlight: 'launch.',
  sub: ['One team designs, builds and launches your website,', 'web app or mobile app, from the first call to launch day.'],
  toast: 'Release 3 is live on staging',
};

// Card outline with the chamfered top-right corner from the developerlook.com hero.
const CARD = 'M16.5 .5H799.5L839.5 40.5V333.5Q839.5 349.5 823.5 349.5H16.5Q.5 349.5 .5 333.5V16.5Q.5 .5 16.5 .5Z';
const COLUMNS = [34, 52, 40, 64, 48, 72, 58, 88, 66];
const PEAK = COLUMNS.indexOf(Math.max(...COLUMNS));

const rect = (x, y, width, height, rx, fill, extra = {}) => el('rect', { x, y, width, height, rx, fill, ...extra });
const circle = (cx, cy, r, fill) => el('circle', { cx, cy, r, fill });

function browserWindow(t) {
  const kpi = (x, valueWidth, valueFill) =>
    rect(x, 100, 56, 38, 8, t.pill, { stroke: t.windowStroke }) + rect(x + 8, 109, 24, 4, 2, t.line) + rect(x + 8, 121, valueWidth, 8, 3, valueFill);
  const columns = COLUMNS.map((h, i) =>
    rect(616 + i * 19.5, 240 - h, 12, h, 3, i === PEAK ? t.highlight : t.series, { class: 'gy', style: `animation-delay:${i * 40}ms` }),
  ).join('');
  return el(
    'g',
    { filter: 'url(#lift)' },
    rect(532, 60, 272, 196, 12, t.window, { stroke: t.windowStroke }),
    el('line', { x1: 532, y1: 88.5, x2: 804, y2: 88.5, stroke: t.windowStroke }),
    circle(550, 74, 4, t.lineStrong) + circle(564, 74, 4, t.lineStrong) + circle(578, 74, 4, t.lineStrong),
    rect(598, 67, 150, 14, 7, t.pill, { stroke: t.windowStroke }),
    text(611, 77.6, 'staging.yourapp.com', { size: 9, weight: 600, fill: t.textMuted }),
    rect(544, 100, 14, 14, 4, t.mark),
    rect(544, 126, 40, 6, 3, t.mark) + rect(544, 142, 34, 6, 3, t.line) + rect(544, 158, 44, 6, 3, t.line) + rect(544, 174, 30, 6, 3, t.line),
    el('line', { x1: 602.5, y1: 88, x2: 602.5, y2: 256, stroke: t.windowStroke }),
    kpi(614, 34, t.mark) + kpi(678, 28, t.lineStrong) + kpi(742, 36, t.lineStrong),
    el('line', { x1: 614, y1: 240.5, x2: 796, y2: 240.5, stroke: t.windowStroke }),
    columns,
  );
}

function phone(t) {
  const row = (y, width, tagFill) => circle(732, y, 5, t.lineStrong) + rect(742, y - 2.5, width, 5, 2.5, t.line) + rect(784, y - 2.5, 12, 5, 2.5, tagFill);
  return el(
    'g',
    { filter: 'url(#lift)' },
    rect(716, 150, 92, 180, 18, t.phone, { stroke: t.phoneStroke }),
    rect(748, 158, 28, 6, 3, t.phoneStroke),
    circle(733, 180, 6, t.lineStrong) + rect(745, 177, 38, 6, 3, t.line),
    rect(726, 194, 72, 46, 10, 'url(#screen)'),
    rect(734, 204, 28, 4, 2, '#FFFFFF', { opacity: 0.7 }) + rect(734, 214, 44, 9, 3, '#FFFFFF', { opacity: 0.95 }) + rect(734, 229, 20, 4, 2, '#FFFFFF', { opacity: 0.6 }),
    row(254, 36, t.mark) + row(272, 30, t.line) + row(290, 40, t.line),
    rect(726, 304, 72, 16, 8, t.mark) + rect(748, 310, 28, 4, 2, '#FFFFFF'),
  );
}

function toast(t) {
  return el(
    'g',
    { filter: 'url(#lift)' },
    rect(490, 226, 196, 36, 10, t.surface, { stroke: t.border }),
    circle(508, 244, 8, t.mark),
    el('path', { d: 'M504.2 244.2l2.6 2.6 5-5.2', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    text(523, 248, HERO_COPY.toast, { size: 11.5, weight: 600, fill: t.text }),
  );
}

export function renderHero({ font }) {
  const t = HERO;
  const { eyebrow, line1, line2, highlight, sub } = HERO_COPY;
  assertOnest('DeveloperLook', line1, line2, highlight);
  const defs =
    '<defs>' +
    `<radialGradient id="glow" cx="14%" cy="112%" r="80%"><stop offset="0" stop-color="${t.glow}" stop-opacity=".5"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="hl" x1="0" x2="1"><stop offset="0" stop-color="${t.highlightFrom}"/><stop offset="1" stop-color="${t.highlightTo}"/></linearGradient>` +
    `<linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.cardFrom}"/><stop offset="1" stop-color="${t.cardTo}"/></linearGradient>` +
    `<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="${t.dot}"/></pattern>` +
    `<clipPath id="card"><path d="${CARD}"/></clipPath>` +
    '<filter id="lift" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".5"/></filter>' +
    '</defs>';
  const heading = { size: 52, weight: 500, fill: t.text, extra: { class: 'o', 'letter-spacing': -1.6 } };
  const body =
    defs +
    el('path', { d: CARD, fill: t.card, stroke: t.border }) +
    el('g', { 'clip-path': 'url(#card)' }, rect(0, 0, 840, 350, 0, 'url(#glow)'), rect(516, 24, 300, 306, 0, 'url(#dots)')) +
    renderMark({ x: 40, y: 38, height: 30, theme: t }) +
    text(76, 61, 'DeveloperLook', { size: 22, weight: 600, fill: t.text, extra: { class: 'o', 'letter-spacing': -0.3 } }) +
    text(40, 124, eyebrow, { size: 12.5, weight: 600, fill: t.eyebrow, extra: { 'letter-spacing': 1.8 } }) +
    text(37, 182, line1, heading) +
    el('text', { x: 37, y: 240, fill: t.text, 'font-size': 52, 'font-weight': 500, class: 'o', 'letter-spacing': -1.6 }, esc(line2), el('tspan', { fill: 'url(#hl)' }, esc(highlight))) +
    rect(318, 232, 30, 7, 2, t.accent, { class: 'cursor' }) +
    sub.map((line, i) => text(40, 286 + i * 24, line, { size: 16.5, fill: t.textSecondary })).join('') +
    browserWindow(t) +
    phone(t) +
    toast(t);
  return svgDoc({
    width: 840,
    height: 350,
    title: 'DeveloperLook: web and mobile apps that launch',
    desc: `US software development company since 2018. ${sub.join(' ')}`,
    body,
    style: `${onestStyle(font)}${GROW_STYLE}.cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`,
  });
}
