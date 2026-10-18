import { THEMES } from './theme.mjs';
import { HERO_COPY } from './assets/hero.mjs';
import { FACTS } from './assets/stats.mjs';
import { MORE_SERVICES, SERVICES } from './assets/services.mjs';
import { WORK } from './assets/work.mjs';
import { PRODUCTS } from './assets/products.mjs';
import { STEPS } from './assets/process.mjs';
import { STACK, itemName } from './assets/stack.mjs';
import { BUTTONS } from './assets/buttons.mjs';

export const RAW = 'https://raw.githubusercontent.com/DeveloperLook/.github';
const asset = (name) => `${RAW}/main/assets/${name}`;
const chart = (name) => `${RAW}/output/${name}`;

const attr = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// `size` is the img sizing attribute, e.g. 'width="32%"' or 'height="48"'.
function picture(dark, light, alt, size) {
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${dark}"><img alt="${attr(alt)}" src="${light}" ${size}></picture>`;
}

const themed = (name, alt, width) => picture(asset(`${name}-${THEMES.dark.name}.svg`), asset(`${name}-${THEMES.light.name}.svg`), alt, `width="${width}"`);
const themedChart = (name, alt, width) => picture(chart(`${name}-dark.svg`), chart(`${name}-light.svg`), alt, `width="${width}"`);
const sentence = (value) => value.replace(/[,.]$/, '');

const SHIELDS = [
  { label: 'Website', message: 'developerlook.com', url: 'https://developerlook.com' },
  { label: 'Book', message: 'a free call', url: 'https://developerlook.com/contact#book-a-call' },
  { label: 'Clutch', message: '5-star rated', url: 'https://clutch.co/profile/developerlook' },
  { label: 'Trustpilot', message: 'Excellent', url: 'https://www.trustpilot.com/review/developerlook.com' },
  { label: 'Upwork', message: 'Top Rated Plus', url: 'https://www.upwork.com/agencies/developerlook/' },
  { label: 'LinkedIn', message: 'developerlook', url: 'https://www.linkedin.com/company/developerlook' },
];

// shields.io path segments: "-" doubles to "--", "_" to "__", and the rest is URL-encoded.
const shieldText = (value) => encodeURIComponent(value.replaceAll('-', '--').replaceAll('_', '__'));

export function renderReadme() {
  const hero = `${HERO_COPY.line1} ${HERO_COPY.line2}${HERO_COPY.highlight}`.replace('&', 'and');
  const stats = FACTS.map((f) => f.spoken).join('. ');
  const lines = [
    '<!-- Graphics are built by scripts/build-assets.mjs. The engineering charts are regenerated daily by .github/workflows/org-stats.yml -->',
    '',
    '<a href="https://developerlook.com">',
    `  <img alt="${attr(`DeveloperLook: ${hero} A US software development company since 2018. ${HERO_COPY.sub.join(' ')}`)}" src="${asset('hero.svg')}" width="100%">`,
    '</a>',
    '',
    themed('stats', `${stats}.`, '100%'),
    '',
    '<p align="center">',
    ...SHIELDS.map(
      (s) =>
        `  <a href="${s.url}"><img alt="${attr(`${s.label}: ${s.message}`)}" src="https://img.shields.io/badge/${shieldText(s.label)}-${shieldText(s.message)}-673DE6?style=flat-square&amp;labelColor=2B2141"></a>`,
    ),
    '</p>',
    '',
    '## About',
    '',
    'DeveloperLook is a US software development company, founded in 2018. One team of designers, developers and project managers designs, builds and launches web apps, mobile apps and SaaS products for startups and growing businesses in the US, UK, Canada, Australia and Singapore.',
    '',
    'Every project gets one project manager, two week sprints and a live staging link, so you judge progress by working software, not status reports. [More about us](https://developerlook.com/about)',
    '',
    '## What we build',
    '',
    '<p>',
    ...SERVICES.map((s) => `  <a href="${s.url}">${themed(`service-${s.id}`, `${s.title}: ${sentence(s.lines.join(' '))}.`, '32%')}</a>`),
    '</p>',
    '',
    `Also: ${MORE_SERVICES.map((s) => `[${s.label}](${s.url})`).join(' · ')} · [All services](https://developerlook.com/services)`,
    '',
    '## Selected work',
    '',
    '<p>',
    ...WORK.map((w) => `  <a href="${w.url}"><img alt="${attr(`${w.name} case study: ${w.alt}.`)}" src="${asset(`work-${w.id}.svg`)}" width="32%"></a>`),
    '</p>',
    '',
    'Browse 100+ case studies in our [portfolio](https://developerlook.com/portfolio).',
    '',
    '## Our products',
    '',
    '<p>',
    ...PRODUCTS.map((p) => `  <a href="${p.url}">${themed(`product-${p.id}`, `${p.name}: ${p.tagline}. ${p.lines.join(' ')} ${p.chips.join(', ')}.`, '32%')}</a>`),
    '</p>',
    '',
    '## How we work',
    '',
    themed('process', `${STEPS.map((s, i) => `${i + 1}. ${s.title.join(' ')}, ${s.time}`).join('. ')}. One project manager, two week sprints and a live staging link at the end of every sprint.`, '100%'),
    '',
    '## Tech stack',
    '',
    themed('stack', `Tech stack. ${STACK.map((g) => `${g.label}: ${g.items.map(itemName).join(', ')}`).join('. ')}.`, '100%'),
    '',
    '## Engineering activity',
    '',
    'Most client work lives in private repositories. These charts total every DeveloperLook repository and refresh daily: no code, project or client names.',
    '',
    themedChart('overview', 'Overview: commits in the last 12 months, repositories, active repositories, repositories pushed in the last 30 days and new repositories.', '100%'),
    '',
    themedChart('activity', 'Column chart of commits per month across all DeveloperLook repositories over the last 12 months, with the peak month highlighted.', '100%'),
    '',
    '<p>',
    `  ${themedChart('languages', 'Bar chart of the languages across all DeveloperLook repositories, by share of code.', '49%')}`,
    `  ${themedChart('cadence', 'Column chart of how many repositories received commits each month over the last 12 months.', '49%')}`,
    '</p>',
    '',
    `<sub><a href="https://github.com/DeveloperLook/.github/blob/output/stats.md">View these numbers as tables</a></sub>`,
    '',
    '## Have a product in mind?',
    '',
    'Tell us where you are. In one 30 minute call we walk you through how we would build it, how long it takes and what it costs.',
    '',
    '<p>',
    ...BUTTONS.map((b) => `  <a href="${b.url}">${picture(asset(`btn-${b.id}-dark.svg`), asset(`btn-${b.id}-light.svg`), b.label, 'height="48"')}</a>`),
    '</p>',
    '',
    '<sub>DeveloperLook · Sheridan, Wyoming, United States · <a href="mailto:hello@developerlook.com">hello@developerlook.com</a> · <a href="https://www.linkedin.com/company/developerlook">LinkedIn</a> · <a href="https://dribbble.com/developerlook">Dribbble</a></sub>',
    '',
  ];
  return lines.join('\n');
}
