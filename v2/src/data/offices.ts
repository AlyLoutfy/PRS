// Offices from the Figma footer / "Kontakt" frame. Only Zug has a street address in the design;
// for the globe the other offices are pinned at country level (capital coordinates).
import type { CountryKey } from './team';

export const EMAIL = 'solutions@prs-zug.com';

export interface Office {
  key: Exclude<CountryKey, 'ec'>;
  address?: string[];
  phone: string;
  lat: number;
  lon: number;
}

export const offices: Office[] = [
  { key: 'ch', address: ['PRS', 'Raingässli 1', '6300 Zug'], phone: '+41 41 541 79 16', lat: 47.1662, lon: 8.5155 },
  { key: 'si', phone: '+386 31 760 798', lat: 46.0569, lon: 14.5058 },
  { key: 'mx', phone: '+52 55 6316 0832', lat: 19.4326, lon: -99.1332 },
  { key: 'pe', phone: '+51 94 796 20 00', lat: -12.0464, lon: -77.0428 },
];

/** Places PRS works without a listed office (from the "Internationale Reichweite" copy). */
export const presence = [{ key: 'ec' as const, lat: -0.1807, lon: -78.4678 }];

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function formatCoord(lat: number, lon: number): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
  return `${f(lat, 'N', 'S')}  ${f(lon, 'E', 'W')}`;
}
