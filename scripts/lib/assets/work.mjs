import { el, svgDoc, text, textWidth } from '../svg.mjs';

const PORTFOLIO = 'https://developerlook.com/portfolio';

// Featured on the developerlook.com home page. Shots come from each case study (assets/vendor/work).
export const WORK = [
  { id: 'havenhues', tag: 'REAL ESTATE', name: 'HavenHues', sub: 'Real estate website', url: `${PORTFOLIO}/haven-hues-real-estate-website`, alt: 'HavenHues homepage on a laptop with a large wordmark above a modern home' },
  { id: 'artchain', tag: 'CRYPTO & NFT', name: 'ArtChain', sub: 'NFT art website and dashboard', url: `${PORTFOLIO}/art-chain-nft-digital-arts-website-and-dashboard`, alt: 'ArtChain NFT marketplace home page on a laptop with a Discover digital art hero' },
  { id: 'tripnest', tag: 'TRAVEL', name: 'TripNest', sub: 'Travel and tour booking website', url: `${PORTFOLIO}/trip-nest-travel-and-tour-website`, alt: 'TripNest home page on a laptop with the hero trip search bar and Eiffel Tower photo' },
  { id: 'logify', tag: 'CONSTRUCTION', name: 'Logify', sub: 'Risk and control web app', url: `${PORTFOLIO}/logify-webapp-development`, alt: 'Logify controls dashboard for the Solidaritus Foundation Roads project on a tablet' },
  { id: 'elevatex', tag: 'AGENCY', name: 'ElevateX', sub: 'Digital agency website', url: `${PORTFOLIO}/elevate-x-agency-website`, alt: 'ElevateX agency home page on a laptop in an office' },
  { id: 'sefinix', tag: 'FURNITURE', name: 'Sefinix', sub: 'Furniture store and dashboard', url: `${PORTFOLIO}/sefinix-furniture-e-commerce`, alt: 'Sefinix homepage on a laptop with the headline Discover the Essence of Minimalist Furniture' },
];

export const WORK_CARD = { width: 272, height: 170 };

// One file per project for both GitHub themes: the caption sits on a dark scrim over the photo.
export function renderWorkCard(project, photoBase64) {
  const { width, height } = WORK_CARD;
  // Bold capitals run about 12% wider than textWidth() assumes; letter-spacing adds 0.9 per glyph.
  const tagWidth = textWidth(project.tag, 9.5) * 1.12 + 0.9 * project.tag.length + 16;
  const body =
    '<defs>' +
    `<clipPath id="round"><rect width="${width}" height="${height}" rx="14"/></clipPath>` +
    '<linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1"><stop offset=".38" stop-color="#09040F" stop-opacity="0"/><stop offset="1" stop-color="#09040F" stop-opacity=".92"/></linearGradient>' +
    '</defs>' +
    el(
      'g',
      { 'clip-path': 'url(#round)' },
      el('image', { href: `data:image/jpeg;base64,${photoBase64}`, width, height, preserveAspectRatio: 'xMidYMid slice' }),
      el('rect', { width, height, fill: 'url(#scrim)' }),
    ) +
    el('rect', { x: 0.5, y: 0.5, width: width - 1, height: height - 1, rx: 13.5, fill: 'none', stroke: '#FFFFFF', 'stroke-opacity': 0.1 }) +
    el('rect', { x: 12, y: 12, width: tagWidth, height: 20, rx: 6, fill: '#09040F', 'fill-opacity': 0.6, stroke: '#FFFFFF', 'stroke-opacity': 0.16 }) +
    text(20, 25.6, project.tag, { size: 9.5, weight: 700, fill: '#FFFFFF', extra: { 'letter-spacing': 0.9 } }) +
    text(16, 138, project.name, { size: 16, weight: 700, fill: '#FFFFFF' }) +
    text(16, 156, project.sub, { size: 12, fill: '#DCD3F7' }) +
    text(256, 156, '↗', { size: 14, fill: '#FFFFFF', anchor: 'end', extra: { 'fill-opacity': 0.85 } });
  return svgDoc({ width, height, title: `${project.name}: ${project.sub}`, desc: project.alt, body });
}
