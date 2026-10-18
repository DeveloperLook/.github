import { cardRect, el, nestSvg, svgDoc, text, textWidth } from '../svg.mjs';

// From developerlook.com (process page tech list and FAQ) plus the team's day-to-day stack.
// Icons come from skillicons.dev (MIT, vendored in assets/vendor/skillicons). "text:" items have no icon there.
export const STACK = [
  { label: 'Frontend', items: ['react', 'nextjs', 'nuxtjs', 'ts', 'tailwind', 'redux'] },
  { label: 'Mobile & desktop', items: ['text:React Native', 'flutter', 'electron'] },
  { label: 'Backend', items: ['nodejs', 'nestjs', 'express', 'laravel', 'django', 'py', 'php'] },
  { label: 'Data', items: ['postgres', 'mysql', 'mongodb', 'firebase', 'supabase', 'redis', 'prisma'] },
  { label: 'Commerce & CMS', items: ['text:Shopify', 'text:WooCommerce', 'wordpress', 'webflow', 'text:Strapi'] },
  { label: 'Cloud & DevOps', items: ['aws', 'vercel', 'netlify', 'cloudflare', 'docker', 'kubernetes', 'githubactions'] },
  { label: 'AI & automation', items: ['text:OpenAI', 'text:Anthropic Claude', 'text:Google Gemini', 'text:n8n', 'text:Make', 'text:Zapier'] },
];

const NAMES = {
  react: 'React', nextjs: 'Next.js', nuxtjs: 'Nuxt', ts: 'TypeScript', tailwind: 'Tailwind CSS', redux: 'Redux', flutter: 'Flutter',
  electron: 'Electron', nodejs: 'Node.js', nestjs: 'NestJS', express: 'Express', laravel: 'Laravel', django: 'Django', py: 'Python',
  php: 'PHP', postgres: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB', firebase: 'Firebase', supabase: 'Supabase', redis: 'Redis',
  prisma: 'Prisma', wordpress: 'WordPress', webflow: 'Webflow', aws: 'AWS', vercel: 'Vercel', netlify: 'Netlify',
  cloudflare: 'Cloudflare', docker: 'Docker', kubernetes: 'Kubernetes', githubactions: 'GitHub Actions',
};

export const STACK_ICONS = [...new Set(STACK.flatMap((group) => group.items.filter((item) => !item.startsWith('text:'))))];

export const itemName = (item) => (item.startsWith('text:') ? item.slice(5) : NAMES[item]);

// Only the neutral skillicons tiles are recoloured, in either attribute order;
// brand tiles such as TypeScript's blue square are part of the logo and stay.
const NEUTRAL_TILE = /(<rect width="256" height="256" (?:rx="60" )?fill=")#(?:242938|F4F2ED|F4F4ED)("(?: rx="60")?\/>)/i;

export function retile(source, color) {
  return source.replace(NEUTRAL_TILE, `$1${color}$2`);
}

export function renderStack(theme, icons) {
  const width = 840;
  const padding = 28;
  const rowHeight = 58;
  const tile = 42;
  const gap = 10;
  const itemsX = 210;
  const height = padding * 2 + STACK.length * rowHeight - (rowHeight - tile);
  let body = cardRect(width, height, theme, 14);
  STACK.forEach((group, row) => {
    const y = padding + row * rowHeight;
    body += text(28, y + tile / 2 + 5, group.label, { size: 14, weight: 600, fill: theme.textSecondary });
    let x = itemsX;
    for (const item of group.items) {
      if (item.startsWith('text:')) {
        const label = item.slice(5);
        const chipWidth = textWidth(label, 13) + 28;
        body += el('rect', { x, y, width: chipWidth, height: tile, rx: 10, fill: theme.tile });
        body += text(x + chipWidth / 2, y + tile / 2 + 4.5, label, { size: 13, weight: 600, fill: theme.text, anchor: 'middle' });
        x += chipWidth + gap;
      } else {
        const source = icons[`${item}-${theme.name}`];
        if (!source) throw new Error(`Missing icon: ${item}-${theme.name}`);
        body += nestSvg(retile(source, theme.tile), { x, y, width: tile, height: tile, prefix: `${item}-${theme.name}` });
        x += tile + gap;
      }
    }
    if (x - gap > width - padding) throw new Error(`Stack row "${group.label}" overflows the card`);
  });
  const desc = `${STACK.map((group) => `${group.label}: ${group.items.map(itemName).join(', ')}`).join('. ')}.`;
  return svgDoc({ width, height, title: 'Tech stack', desc, body });
}
