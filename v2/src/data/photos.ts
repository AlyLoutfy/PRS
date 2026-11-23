// Alpine photography from the PRS_Rebranding Figma file (Homepage: Hero 1, "Genau in der Methode",
// "Für alle, die Risiken tragen"). The source layer is named "portfolio_alps_V2_2026_timothe_beuret".
import type { Locale } from '../i18n';
import { withBase } from '../lib/url';

export interface Photo {
  src: string;
  small: string;
  /** 1280 px rendition (scripts/optimize-images.mjs) */
  mid: string;
  w: number;
  h: number;
  focus: string;
  /** average colour, shown in the frame while the file loads */
  tone: string;
  alt: Record<Locale, string>;
}

export const photos = {
  hero: {
    src: withBase('/photos/hero.webp'), small: withBase('/photos/hero-960.webp'), mid: withBase('/photos/hero-1280.webp'), w: 1893, h: 1262, focus: '50% 45%', tone: '#919690',
    alt: {
      de: 'Alpine Bergketten unter einem hellen Himmel',
      en: 'Alpine ridges under a pale sky',
      es: 'Cordilleras alpinas bajo un cielo claro',
    },
  },
  lake: {
    src: withBase('/photos/lake.webp'), small: withBase('/photos/lake-960.webp'), mid: withBase('/photos/lake-1280.webp'), w: 1876, h: 1251, focus: '50% 50%', tone: '#807f68',
    alt: {
      de: 'Bergsee in einem grünen Alpental',
      en: 'Mountain lake in a green alpine valley',
      es: 'Lago de montaña en un valle alpino verde',
    },
  },
  glacier: {
    src: withBase('/photos/glacier.webp'), small: withBase('/photos/glacier-960.webp'), mid: withBase('/photos/glacier-1280.webp'), w: 1892, h: 1261, focus: '50% 55%', tone: '#9a9f9b',
    alt: {
      de: 'Wandernde auf einem Gletscher zwischen steilen Hängen',
      en: 'Hikers crossing a glacier between steep slopes',
      es: 'Excursionistas cruzando un glaciar entre laderas empinadas',
    },
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
export const PHOTO_CREDIT = 'Timothé Beuret';

export const photoSrcSet = (key: PhotoKey) => `${photos[key].small} 960w, ${photos[key].mid} 1280w, ${photos[key].src} ${photos[key].w}w`;
