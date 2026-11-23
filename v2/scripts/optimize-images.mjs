// One-off image preparation for v2 (the results are committed; run again only when a source changes):
//   node v2/scripts/optimize-images.mjs
//  • photos/<name>-1280.webp   a middle size for phones with dense screens (between 960 and the full file)
//  • clients/<name>.webp       client logos at twice their largest display height instead of 144 px PNGs
//  • brand/prs-logo-1024.png   the logo mask at 1024 px instead of the 4096 px export
// Sources are the files exported from the Figma file (kept untouched in the repository root's public/).
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'public');
const out = join(here, '..', 'public');
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

for (const name of ['hero', 'lake', 'glacier']) {
  const info = await sharp(join(src, 'photos', `${name}.webp`)).resize({ width: 1280 }).webp({ quality: 78, effort: 6 }).toFile(join(out, 'photos', `${name}-1280.webp`));
  console.log(`photos/${name}-1280.webp ${info.width}×${info.height} ${kb(info.size)}`);
}
for (const name of ['swiss-re', 'munich-re', 'zurich', 'allianz', 'helvetia']) {
  const info = await sharp(join(src, 'clients', `${name}.png`)).resize({ height: 96 }).webp({ lossless: true, effort: 6 }).toFile(join(out, 'clients', `${name}.webp`));
  console.log(`clients/${name}.webp ${info.width}×${info.height} ${kb(info.size)}`);
}
const logo = await sharp(join(src, 'brand', 'prs-logo.png')).resize({ width: 1024 }).png({ compressionLevel: 9, palette: true, quality: 100 }).toFile(join(out, 'brand', 'prs-logo-1024.png'));
console.log(`brand/prs-logo-1024.png ${logo.width}×${logo.height} ${kb(logo.size)}`);
