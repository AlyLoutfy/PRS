// Team from the Figma "Team" frame (03_Web Design). Names and portraits come from the Figma layers;
// Rebeca Juárez has no photo in the design yet, so she gets a generated monogram.
import type { Locale } from '../i18n';

export type CountryKey = 'ch' | 'si' | 'mx' | 'pe' | 'ec';
type Role = 'shareholder' | 'chair' | 'partner' | 'mdPartner';

export interface Person {
  name: string;
  female: boolean;
  qualified: boolean; // "SAV/DAV"
  role: Role;
  country: CountryKey;
  /** portrait in public/team/<photo>.webp */
  photo?: string;
  linkedin?: string;
  email?: string;
}

export const team: Person[] = [
  { name: 'Moja Buholzer', female: true, qualified: true, role: 'shareholder', country: 'ch' , photo: 'moja-buholzer' },
  { name: 'Dr. Frank Cuypers', female: false, qualified: true, role: 'chair', country: 'ch' , photo: 'frank-cuypers' },
  { name: 'Prof. Dr. Michel Dacorogna', female: false, qualified: true, role: 'partner', country: 'ch' , photo: 'michel-dacorogna' },
  { name: 'Simone Dalessi', female: false, qualified: true, role: 'mdPartner', country: 'ch' , photo: 'simone-dalessi' },
  { name: 'Stéphane Gartenmann', female: false, qualified: true, role: 'shareholder', country: 'ch' , photo: 'stephane-gartenmann' },
  { name: 'Dr. Olivier Steiger', female: false, qualified: true, role: 'shareholder', country: 'ch' , photo: 'olivier-steiger' },
  { name: 'Carla Bellido Balbuena', female: true, qualified: true, role: 'shareholder', country: 'pe' , photo: 'carla-bellido-balbuena' },
  { name: 'Oscar Cerdán', female: false, qualified: true, role: 'shareholder', country: 'pe' , photo: 'oscar-cerdan' },
  { name: 'Guido Monteverde', female: false, qualified: true, role: 'shareholder', country: 'pe' , photo: 'guido-monteverde' },
  { name: 'José Borrego', female: false, qualified: true, role: 'shareholder', country: 'mx' , photo: 'jose-borrego' },
  { name: 'Rebeca Juárez', female: true, qualified: true, role: 'shareholder', country: 'mx' },
  { name: 'Bor Harej', female: false, qualified: false, role: 'shareholder', country: 'si' , photo: 'bor-harej' },
  { name: 'Lucas Arceo Adaui', female: false, qualified: false, role: 'shareholder', country: 'ec' , photo: 'lucas-arceo-adaui' },
];

export function personTitle(p: Person, lang: Locale): string {
  const base =
    lang === 'de' ? (p.female ? 'Aktuarin' : 'Aktuar') : lang === 'es' ? (p.female ? 'Actuaria' : 'Actuario') : 'Actuary';
  return p.qualified ? `${base} SAV/DAV` : base;
}

export function personRole(p: Person, lang: Locale): string {
  const roles: Record<Role, Record<Locale, string>> = {
    shareholder: { de: p.female ? 'Aktionärin' : 'Aktionär', en: 'Shareholder', es: 'Accionista' },
    chair: { de: 'Verwaltungsratspräsident', en: 'Chairman of the Board', es: 'Presidente del Consejo de Administración' },
    partner: { de: 'Partner', en: 'Partner', es: 'Socio' },
    mdPartner: { de: 'Geschäftsführer und Partner', en: 'Managing Director and Partner', es: 'Director General y Socio' },
  };
  return roles[p.role][lang];
}

export function initials(name: string): string {
  const parts = name.replace(/^(Prof\.\s*)?(Dr\.\s*)?/, '').split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '');
}
