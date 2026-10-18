import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { THEMES } from './lib/theme.mjs';
import { renderHero } from './lib/assets/hero.mjs';
import { renderStats } from './lib/assets/stats.mjs';
import { SERVICES, renderServiceCard } from './lib/assets/services.mjs';
import { WORK, renderWorkCard } from './lib/assets/work.mjs';
import { PRODUCTS, renderProductCard } from './lib/assets/products.mjs';
import { renderProcess } from './lib/assets/process.mjs';
import { STACK_ICONS, renderStack } from './lib/assets/stack.mjs';
import { BUTTONS, renderButton } from './lib/assets/buttons.mjs';
import { renderReadme } from './lib/readme.mjs';

export function renderStaticAssets(vendor) {
  const files = { 'hero.svg': renderHero(vendor) };
  for (const project of WORK) files[`work-${project.id}.svg`] = renderWorkCard(project, vendor.photos[project.id]);
  for (const theme of Object.values(THEMES)) {
    files[`stats-${theme.name}.svg`] = renderStats(theme, vendor);
    for (const service of SERVICES) files[`service-${service.id}-${theme.name}.svg`] = renderServiceCard(service, theme);
    for (const product of PRODUCTS) files[`product-${product.id}-${theme.name}.svg`] = renderProductCard(product, theme, vendor.logos);
    files[`process-${theme.name}.svg`] = renderProcess(theme);
    files[`stack-${theme.name}.svg`] = renderStack(theme, vendor.icons);
    for (const button of BUTTONS) files[`btn-${button.id}-${theme.name}.svg`] = renderButton(button, theme);
  }
  return files;
}

const base64 = async (path) => (await readFile(path)).toString('base64');

export async function loadVendor(dir = 'assets/vendor') {
  const icons = {};
  for (const name of STACK_ICONS) {
    for (const theme of Object.keys(THEMES)) icons[`${name}-${theme}`] = await readFile(join(dir, 'skillicons', `${name}-${theme}.svg`), 'utf8');
  }
  const logos = {};
  for (const { logo } of PRODUCTS) {
    const path = join(dir, 'logos', logo.file);
    logos[logo.file] = logo.type === 'svg' ? await readFile(path, 'utf8') : await base64(path);
  }
  const photos = {};
  for (const project of WORK) photos[project.id] = await base64(join(dir, 'work', `${project.id}.jpg`));
  return { icons, logos, photos, font: await base64(join(dir, 'fonts', 'onest-500-700.woff2')) };
}

export async function main(out = 'assets', readme = 'profile/README.md') {
  const files = renderStaticAssets(await loadVendor());
  await mkdir(out, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(out, name), content);
  await writeFile(readme, renderReadme());
  console.log(`build-assets: wrote ${Object.keys(files).length} files to ${out} and ${readme}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
