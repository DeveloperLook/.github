import { cardRect, el, svgDoc, text } from '../svg.mjs';

const SITE = 'https://developerlook.com';

// Copy follows the service pages on developerlook.com. Each card links to its page.
export const SERVICES = [
  { id: 'design', title: 'Web & UI/UX design', lines: ['Mobile-first sites and product UI,', 'tested with real users.'], url: `${SITE}/services/web-design` },
  { id: 'web', title: 'Web development', lines: ['Websites, web apps and CMS', 'platforms, from strategy to launch.'], url: `${SITE}/services/web-development` },
  { id: 'mobile', title: 'Mobile apps', lines: ['iOS and Android apps from one', 'codebase, tested on real phones.'], url: `${SITE}/services/mobile-app-development` },
  { id: 'saas', title: 'SaaS & MVPs', lines: ['SaaS with Stripe billing and roles,', 'or an MVP cut to one journey.'], url: `${SITE}/services/saas-development` },
  { id: 'ecommerce', title: 'E-commerce', lines: ['Shopify, WooCommerce and custom', 'stores, connected to your systems.'], url: `${SITE}/services/e-commerce-development` },
  { id: 'ai', title: 'AI & automation', lines: ['Language models and workflows', 'added to the tools you already run.'], url: `${SITE}/services/ai-training-and-integration` },
];

export const MORE_SERVICES = [
  { label: 'API development', url: `${SITE}/services/api-solutions` },
  { label: 'MVP development', url: `${SITE}/services/mvp-development` },
  { label: 'Technical SEO', url: `${SITE}/services/technical-seo-services` },
  { label: 'Cyber security', url: `${SITE}/services/website-security-audit-services` },
  { label: 'Workflow automation', url: `${SITE}/services/business-process-automation` },
];

// 24px line icons on a 24 unit grid, drawn for these cards.
const ICONS = {
  design: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/>',
  web: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
  saas: '<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5"/>',
  ecommerce: '<path d="M5 8h14l-1.2 11.2a1.8 1.8 0 0 1-1.8 1.6H8a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  ai: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
};

// Text starts 24px in and must stop 16px before the edge (textWidth() errs wide, so this is safe).
export const SERVICE_CARD = { width: 272, height: 150, textWidth: 232 };

export function renderServiceCard(service, theme) {
  const { width, height } = SERVICE_CARD;
  const body =
    cardRect(width, height, theme, 14) +
    el('rect', { x: 24, y: 24, width: 40, height: 40, rx: 10, fill: theme.tile }) +
    `<g transform="translate(32 32)" fill="none" stroke="${theme.mark}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[service.id]}</g>` +
    text(248, 44, '↗', { size: 15, fill: theme.textMuted, anchor: 'end' }) +
    text(24, 94, service.title, { size: 16, weight: 600, fill: theme.text }) +
    service.lines.map((line, i) => text(24, 116 + i * 18, line, { size: 13, fill: theme.textSecondary })).join('');
  return svgDoc({ width, height, title: service.title, desc: service.lines.join(' '), body });
}
