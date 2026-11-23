// Painting registry. The Figma design pairs the copy with Old Master paintings (02_Components / Übersicht). All works below are public domain (or CC0) reproductions on Wikimedia Commons
// and are hot-linked from Wikimedia's thumbnail service. Swap `path` for self-hosted files before launch.
import type { Locale } from '../i18n';

type L = Record<Locale, string>;

export interface Art {
  /** "<hash>/<url-encoded filename>" exactly as served by upload.wikimedia.org */
  path: string;
  artist: L;
  title: L;
  year: L | string;
  collection?: string;
  license: 'Public domain' | 'CC0';
  /** object-position for cropped frames */
  focus: string;
  /** original pixel size (used for the loupe) */
  w: number;
  h: number;
}

const holbein: L = { de: 'Hans Holbein d. J.', en: 'Hans Holbein the Younger', es: 'Hans Holbein el Joven' };
const bruegel: L = { de: 'Pieter Bruegel d. Ä.', en: 'Pieter Bruegel the Elder', es: 'Pieter Brueghel el Viejo' };
const vermeer: L = { de: 'Johannes Vermeer', en: 'Johannes Vermeer', es: 'Johannes Vermeer' };

export const art = {
  census: {
    path: 'e/ea/Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg',
    artist: bruegel,
    title: { de: 'Die Volkszählung zu Bethlehem', en: 'The Census at Bethlehem', es: 'El censo de Belén' },
    year: '1566', collection: 'Royal Museums of Fine Arts of Belgium', license: 'Public domain',
    focus: '50% 58%', w: 15647, h: 10843,
  },
  harvesters: {
    path: '0/05/Pieter_Bruegel_the_Elder-_The_Harvesters_-_Google_Art_Project.jpg',
    artist: bruegel,
    title: { de: 'Die Kornernte', en: 'The Harvesters', es: 'Los cosechadores' },
    year: '1565', collection: 'The Metropolitan Museum of Art', license: 'Public domain',
    focus: '50% 52%', w: 30000, h: 21851,
  },
  gisze: {
    path: '0/01/Hans_Holbein_der_J%C3%BCngere_-_Der_Kaufmann_Georg_Gisze_-_Google_Art_Project.jpg',
    artist: holbein,
    title: { de: 'Der Kaufmann Georg Gisze', en: 'The Merchant Georg Gisze', es: 'El mercader Georg Gisze' },
    year: '1532', collection: 'Gemäldegalerie, Berlin', license: 'Public domain',
    focus: '46% 30%', w: 26292, h: 30000,
  },
  ambassadors: {
    path: '8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg',
    artist: holbein,
    title: { de: 'Die Gesandten', en: 'The Ambassadors', es: 'Los embajadores' },
    year: '1533', collection: 'National Gallery, London', license: 'Public domain',
    focus: '50% 38%', w: 30000, h: 29560,
  },
  goldsmith: {
    path: 'a/aa/A_Goldsmith_in_his_Shop_MET_DT711.jpg',
    artist: { de: 'Petrus Christus', en: 'Petrus Christus', es: 'Petrus Christus' },
    title: { de: 'Ein Goldschmied in seiner Werkstatt', en: 'A Goldsmith in His Shop', es: 'Un orfebre en su taller' },
    year: '1449', collection: 'The Metropolitan Museum of Art', license: 'CC0',
    focus: '50% 42%', w: 3219, h: 3699,
  },
  erasmus: {
    path: '9/94/Hans_Holbein_d._J._-_Erasmus_-_Louvre.jpg',
    artist: holbein,
    title: { de: 'Erasmus von Rotterdam', en: 'Erasmus of Rotterdam', es: 'Erasmo de Róterdam' },
    year: '1523', collection: 'Musée du Louvre', license: 'Public domain',
    focus: '58% 84%', w: 2024, h: 2679,
  },
  syndics: {
    path: '9/95/Rembrandt_-_De_Staalmeesters-_het_college_van_staalmeesters_%28waardijns%29_van_het_Amsterdamse_lakenbereidersgilde_-_Google_Art_Project.jpg',
    artist: { de: 'Rembrandt van Rijn', en: 'Rembrandt van Rijn', es: 'Rembrandt van Rijn' },
    title: { de: 'Die Staalmeesters', en: 'The Syndics of the Drapers’ Guild', es: 'Los síndicos del gremio de pañeros' },
    year: '1662', collection: 'Rijksmuseum, Amsterdam', license: 'Public domain',
    focus: '50% 46%', w: 5918, h: 4000,
  },
  merryFamily: {
    path: '7/72/Jan_Havicksz._Steen_-_Het_vrolijke_huisgezin_-_Google_Art_Project.jpg',
    artist: { de: 'Jan Steen', en: 'Jan Steen', es: 'Jan Steen' },
    title: { de: 'Die fröhliche Familie', en: 'The Merry Family', es: 'La familia alegre' },
    year: '1668', collection: 'Rijksmuseum, Amsterdam', license: 'Public domain',
    focus: '50% 44%', w: 5137, h: 4000,
  },
  athens: {
    path: '4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
    artist: { de: 'Raffael', en: 'Raphael', es: 'Rafael' },
    title: { de: 'Die Schule von Athen', en: 'The School of Athens', es: 'La escuela de Atenas' },
    year: '1509–1511', collection: 'Apostolic Palace, Vatican', license: 'Public domain',
    focus: '74% 80%', w: 3820, h: 2964,
  },
  orrery: {
    path: 'd/d3/Wright_of_Derby%2C_The_Orrery.jpg',
    artist: { de: 'Joseph Wright of Derby', en: 'Joseph Wright of Derby', es: 'Joseph Wright of Derby' },
    title: {
      de: 'Ein Philosoph erklärt das Planetarium',
      en: 'A Philosopher Lecturing on the Orrery',
      es: 'Un filósofo explica el planetario',
    },
    year: { de: 'um 1766', en: 'c. 1766', es: 'h. 1766' }, collection: 'Derby Museum and Art Gallery', license: 'Public domain',
    focus: '50% 50%', w: 6527, h: 4581,
  },
  astronomer: {
    path: 'e/e4/Johannes_Vermeer_-_The_Astronomer_-_1668.jpg',
    artist: vermeer,
    title: { de: 'Der Astronom', en: 'The Astronomer', es: 'El astrónomo' },
    year: '1668', collection: 'Musée du Louvre', license: 'Public domain',
    focus: '50% 40%', w: 4401, h: 5000,
  },
  geographer: {
    path: '2/2a/Johannes_Vermeer_-_The_Geographer_-_Google_Art_Project.jpg',
    artist: vermeer,
    title: { de: 'Der Geograph', en: 'The Geographer', es: 'El geógrafo' },
    year: '1669', collection: 'Städel Museum, Frankfurt', license: 'Public domain',
    focus: '50% 38%', w: 7991, h: 8959,
  },
} satisfies Record<string, Art>;

export type ArtKey = keyof typeof art;

const THUMB = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
const WIDTHS = [960, 1280, 1920] as const;

export function artSrc(key: ArtKey, width: (typeof WIDTHS)[number] = 1280): string {
  const a: Art = art[key];
  const file = a.path.split('/').pop()!;
  const w = Math.min(width, a.w);
  return `${THUMB}${a.path}/${w}px-${file}`;
}

export function artSrcSet(key: ArtKey): string {
  return WIDTHS.filter((w) => w <= art[key].w).map((w) => `${artSrc(key, w)} ${w}w`).join(', ');
}

export function artPage(key: ArtKey): string {
  return `https://commons.wikimedia.org/wiki/File:${art[key].path.split('/').pop()}`;
}

export function artText(key: ArtKey, lang: Locale) {
  const a: Art = art[key];
  const year = typeof a.year === 'string' ? a.year : a.year[lang];
  return { artist: a.artist[lang], title: a.title[lang], year };
}
