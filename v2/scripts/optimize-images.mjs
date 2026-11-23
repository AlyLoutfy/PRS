// One-off image preparation for v2 (the results are committed; run again only when a source changes):
//   node v2/scripts/optimize-images.mjs
//  • photos/<name>-720.webp, -1280.webp, hero-1600.webp   sizes between the 960 px and full files, so phones
//    and laptops are not sent more pixels than their screens show
//  • team/<name>-360.webp      portraits at half size for phones (the 720 px files stay for dense screens)
//  • clients/<name>.webp       client logos at twice their largest display height instead of 144 px PNGs
//  • brand/prs-logo-1024.png   the logo mask at 1024 px instead of the 4096 px export
// Sources are the files exported from the Figma file (kept untouched in the repository root's public/).
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'public');
const out = join(here, '..', 'public');
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

for (const [name, widths] of [['hero', [720, 1280, 1600]], ['lake', [720, 1280]], ['glacier', [720, 1280]]]) {
  for (const width of widths) {
    const info = await sharp(join(src, 'photos', `${name}.webp`)).resize({ width }).webp({ quality: 78, effort: 6 }).toFile(join(out, 'photos', `${name}-${width}.webp`));
    console.log(`photos/${name}-${width}.webp ${info.width}×${info.height} ${kb(info.size)}`);
  }
}
for (const file of readdirSync(join(src, 'team')).filter((f) => f.endsWith('.webp'))) {
  const name = file.replace('.webp', '');
  const info = await sharp(join(src, 'team', file)).resize({ width: 360 }).webp({ quality: 80, effort: 6 }).toFile(join(out, 'team', `${name}-360.webp`));
  console.log(`team/${name}-360.webp ${info.width}×${info.height} ${kb(info.size)}`);
}
for (const name of ['swiss-re', 'munich-re', 'zurich', 'allianz', 'helvetia']) {
  const info = await sharp(join(src, 'clients', `${name}.png`)).resize({ height: 96 }).webp({ lossless: true, effort: 6 }).toFile(join(out, 'clients', `${name}.webp`));
  console.log(`clients/${name}.webp ${info.width}×${info.height} ${kb(info.size)}`);
}
const logo = await sharp(join(src, 'brand', 'prs-logo.png')).resize({ width: 1024 }).png({ compressionLevel: 9, palette: true, quality: 100 }).toFile(join(out, 'brand', 'prs-logo-1024.png'));
console.log(`brand/prs-logo-1024.png ${logo.width}×${logo.height} ${kb(logo.size)}`);
