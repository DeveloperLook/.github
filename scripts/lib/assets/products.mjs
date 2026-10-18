import { cardRect, el, nestSvg, svgDoc, text, textWidth } from '../svg.mjs';

// Products DeveloperLook builds and runs. Copy follows each product's own site.
export const PRODUCTS = [
  {
    id: 'staffic',
    name: 'Staffic',
    tagline: 'Time tracking SaaS',
    lines: ['Tracks time, apps, URLs and', 'screenshots, then turns them into', 'timesheets, payroll and invoices.'],
    chips: ['Web + desktop', 'Free plan'],
    link: 'staffic.io',
    url: 'https://staffic.io',
    logo: { file: 'staffic.svg', type: 'svg' },
  },
  {
    id: 'rental-suite',
    name: 'Rental Suite',
    tagline: 'Rental booking for Shopify',
    lines: ['Rent out cameras, bikes, tools and', 'event gear with a live calendar,', 'deposits and subscriptions.'],
    chips: ['Shopify app', 'Free plan'],
    link: 'rentalsuite.developerlook.com',
    url: 'https://rentalsuite.developerlook.com',
    logo: { file: 'rental-suite.png', type: 'png' },
  },
  {
    id: 'cartwheel',
    name: 'Cartwheel',
    tagline: 'Post-purchase for Shopify',
    lines: ['Upsells, cart recovery emails,', 'retention sequences, reviews and', 'loyalty in one app.'],
    chips: ['Shopify app', 'Free plan'],
    link: 'cartwheel.developerlook.com',
    url: 'https://cartwheel.developerlook.com',
    logo: { file: 'cartwheel.png', type: 'png' },
  },
];

// Text starts 24px in and must stop 16px before the edge (textWidth() errs wide, so this is safe).
export const PRODUCT_CARD = { width: 272, height: 236, textWidth: 232, taglineWidth: 170 };

function chipRow(labels, theme) {
  let x = 24;
  return labels
    .map((label) => {
      const width = textWidth(label, 11.5) + 18;
      const chip = el('rect', { x, y: 168, width, height: 24, rx: 7, fill: theme.tile }) + text(x + width / 2, 184, label, { size: 11.5, fill: theme.text, anchor: 'middle' });
      x += width + 6;
      return chip;
    })
    .join('');
}

export function renderProductCard(product, theme, logos) {
  const { width, height } = PRODUCT_CARD;
  const source = logos[product.logo.file];
  if (!source) throw new Error(`Missing logo: ${product.logo.file}`);
  const logo =
    product.logo.type === 'svg'
      ? nestSvg(source, { x: 24, y: 24, width: 48, height: 48, prefix: `${product.id}-${theme.name}` })
      : '<defs><clipPath id="logo"><rect x="24" y="24" width="48" height="48" rx="12"/></clipPath></defs>' +
        el('image', { href: `data:image/png;base64,${source}`, x: 24, y: 24, width: 48, height: 48, 'clip-path': 'url(#logo)' });
  const body =
    cardRect(width, height, theme, 14) +
    logo +
    text(86, 45, product.name, { size: 17, weight: 600, fill: theme.text }) +
    text(86, 65, product.tagline, { size: 12.5, fill: theme.textSecondary }) +
    product.lines.map((line, i) => text(24, 104 + i * 19, line, { size: 13, fill: theme.text })).join('') +
    chipRow(product.chips, theme) +
    text(24, 216, `${product.link} ↗`, { size: 12.5, weight: 600, fill: theme.link });
  return svgDoc({
    width,
    height,
    title: `${product.name}: ${product.tagline}`,
    desc: `${product.lines.join(' ')} ${product.chips.join(', ')}.`,
    body,
  });
}
