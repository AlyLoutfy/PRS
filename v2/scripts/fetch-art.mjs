// Downloads the public-domain paintings used on the site from Wikimedia Commons and writes optimised
// WebP renditions to public/art/ (self-hosted: no third-party requests at runtime).
// Run once, or after changing the list in src/data/art.ts:
//   node v2/scripts/fetch-art.mjs                 download from Wikimedia, then convert
//   node v2/scripts/fetch-art.mjs --from <dir>    convert JPEGs already saved as <dir>/<key>-<width>.jpg
// The generated files are committed, so builds and CI never need network access to Wikimedia.
// (Wikimedia throttles thumbnail rendering per IP; the script retries, and --from covers the rest.)
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'art');

// key → "<hash>/<file name>" on upload.wikimedia.org (same keys as src/data/art.ts)
const sources = {
  census: 'e/ea/Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg',
  harvesters: '0/05/Pieter_Bruegel_the_Elder-_The_Harvesters_-_Google_Art_Project.jpg',
  gisze: '0/01/Hans_Holbein_der_J%C3%BCngere_-_Der_Kaufmann_Georg_Gisze_-_Google_Art_Project.jpg',
  ambassadors: '8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg',
  goldsmith: 'a/aa/A_Goldsmith_in_his_Shop_MET_DT711.jpg',
  erasmus: '9/94/Hans_Holbein_d._J._-_Erasmus_-_Louvre.jpg',
  syndics:
    '9/95/Rembrandt_-_De_Staalmeesters-_het_college_van_staalmeesters_%28waardijns%29_van_het_Amsterdamse_lakenbereidersgilde_-_Google_Art_Project.jpg',
  merryFamily: '7/72/Jan_Havicksz._Steen_-_Het_vrolijke_huisgezin_-_Google_Art_Project.jpg',
  athens: '4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
  orrery: 'd/d3/Wright_of_Derby%2C_The_Orrery.jpg',
  astronomer: 'e/e4/Johannes_Vermeer_-_The_Astronomer_-_1668.jpg',
  geographer: '2/2a/Johannes_Vermeer_-_The_Geographer_-_Google_Art_Project.jpg',
};

const WIDTHS = [640, 960, 1280];
const QUALITY = { 640: 76, 960: 74, 1280: 72 };
const fromDir = process.argv.includes('--from') ? process.argv[process.argv.indexOf('--from') + 1] : null;
const local = (key) => [1920, 1280].map((w) => join(fromDir ?? '', `${key}-${w}.jpg`)).find((f) => fromDir && existsSync(f));
const UA = 'Mozilla/5.0 (compatible; site-asset-fetch/1.0)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The thumbnail service throttles bursts (HTTP 429): retry with a growing pause.
async function download(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (attempt >= 5 || ![429, 500, 502, 503].includes(res.status)) throw new Error(`${res.status} — ${url}`);
    const wait = 5000 * 2 ** attempt;
    process.stdout.write(`  ${res.status}, retrying in ${wait / 1000}s\n`);
    await sleep(wait);
  }
}

await mkdir(outDir, { recursive: true });
for (const [key, path] of Object.entries(sources)) {
  const file = path.split('/').pop();
  const saved = local(key);
  const input = saved ? await readFile(saved) : await download(`https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/1280px-${file}`);
  const meta = await sharp(input).metadata();
  for (const w of WIDTHS) {
    const buf = await sharp(input)
      .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
      .webp({ quality: QUALITY[w], effort: 6, smartSubsample: true })
      .toBuffer();
    await writeFile(join(outDir, `${key}-${w}.webp`), buf);
    process.stdout.write(`${key}-${w}.webp ${(buf.length / 1024).toFixed(0)} kB\n`);
  }
  // Be polite to the thumbnail service.
  if (!saved) await sleep(1500);
}
console.log('done');
