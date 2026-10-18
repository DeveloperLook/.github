import { cardRect, el, svgDoc, text } from '../svg.mjs';
import { assertOnest, onestStyle } from '../fonts.mjs';

// Facts from the DeveloperLook CMS house rules: they must match developerlook.com word for word.
export const FACTS = [
  { value: '1,250+', label: 'Projects shipped', sub: 'Including white-label work', spoken: '1,250+ projects shipped, including white-label work' },
  { value: '668+', label: 'Satisfied clients', sub: 'Founders and growing teams', spoken: '668+ satisfied clients, from founders to growing teams' },
  { value: '5-star', label: 'Average rating', sub: 'Top Rated Plus on Upwork', stars: true, spoken: '5-star average rating, Top Rated Plus on Upwork' },
  { value: '2018', label: 'Founded in the US', sub: 'Sheridan, Wyoming', spoken: 'Founded in the US in 2018, in Sheridan, Wyoming' },
];

const STAR = 'M5 0l1.47 3.06 3.28.42-2.4 2.28.6 3.32L5 7.5 2.05 9.08l.6-3.32-2.4-2.28 3.28-.42z';

export function renderStats(theme, { font }) {
  const width = 840;
  const height = 120;
  const cell = width / FACTS.length;
  assertOnest(...FACTS.map((f) => f.value));
  const cells = FACTS.map((fact, i) => {
    const x = i * cell + 28;
    const divider = i ? el('line', { x1: i * cell + 0.5, x2: i * cell + 0.5, y1: 26, y2: 94, stroke: theme.border }) : '';
    const stars = fact.stars
      ? Array.from({ length: 5 }, (_, s) => el('path', { d: STAR, fill: theme.accent, transform: `translate(${x + 104 + s * 12} 38)` })).join('')
      : '';
    return (
      divider +
      text(x, 58, fact.value, { size: 32, weight: 600, fill: theme.text, extra: { class: 'o', 'letter-spacing': -0.8 } }) +
      stars +
      text(x, 84, fact.label, { size: 14, weight: 600, fill: theme.text }) +
      text(x, 104, fact.sub, { size: 12.5, fill: theme.textMuted })
    );
  });
  return svgDoc({
    width,
    height,
    title: 'DeveloperLook in numbers',
    desc: `${FACTS.map((f) => f.spoken).join('. ')}.`,
    body: cardRect(width, height, theme, 14) + cells.join(''),
    style: onestStyle(font),
  });
}
