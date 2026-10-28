import type { Fighter } from '../types';
import { availableFighterPortraitSvgs, availableFighterDisplaySvgs } from './fighterArt.generated';

/** Only the small cards in Character Select use portrait SVGs. */
export const fighterPortraitOverrides: Record<string, string> = {};
/** Selected fighter and fighter detail pages use display SVGs. */
export const fighterDisplayOverrides: Record<string, string> = {};

/** Optional adjustments for individual portrait SVGs (percent position / zoom).
 * Example: 'ryu': { x: 50, y: 15, zoom: 1.25 }
 */
export const portraitFraming: Record<string, { x: number; y: number; zoom: number }> = {};

function normalize(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

function filePart(url: string) {
  const decoded = decodeURIComponent(url.split('/').pop() ?? '');
  return decoded.replace(/\.svg$/i, '');
}

function score(url: string, fighter: Fighter): number {
  const stem = normalize(filePart(url));
  const reduced = stem.replace(/streetfighter6|streetfighter|sf6|character|portrait|profile|display|render|artwork|fighter|transparent|fullbody|cutout|official|thumb|image|art|card|icon/g, '').replace(/[0-9]+$/, '');
  const aliases = [fighter.id, fighter.name];
  if (fighter.id === 'e-honda') aliases.push('Honda');
  if (fighter.id === 'dee-jay') aliases.push('Deejay');
  if (fighter.id === 'm-bison') aliases.push('Bison');
  if (fighter.id === 'c-viper') aliases.push('Viper');
  const keys = [...new Set(aliases.map(normalize))];
  const parent = normalize(decodeURIComponent(url.split('/').at(-2) ?? ''));
  let best = 0;
  for (const key of keys) {
    if (!key) continue;
    if (stem === key) best = Math.max(best, 100);
    if (reduced === key) best = Math.max(best, 95);
    if (stem === `${key}sf6` || stem === `sf6${key}`) best = Math.max(best, 94);
    if (stem.startsWith(`${key}portrait`) || stem.startsWith(`${key}display`) || stem.startsWith(`${key}render`) || stem.startsWith(`${key}character`) || stem.startsWith(`${key}art`)) best = Math.max(best, 90);
    if (stem.startsWith(`sf6${key}`) || stem.startsWith(`character${key}`) || stem.startsWith(`portrait${key}`) || stem.startsWith(`display${key}`) || stem.startsWith(`fighter${key}`)) best = Math.max(best, 88);
    if (parent === key && ['portrait', 'display', 'art', 'character', 'render', 'default', 'fighter'].includes(stem)) best = Math.max(best, 87);
    if (stem.startsWith(key) && /^([0-9]|svg|thumb|icon|profile|image|full|cutout)/.test(stem.slice(key.length))) best = Math.max(best, 82);
  }
  return best;
}

/** The two variants resolve exclusively from their own asset directory. */
export function getFighterArtwork(fighter: Fighter, variant: 'portrait' | 'stage'): string | null {
  const isPortrait = variant === 'portrait';
  const override = (isPortrait ? fighterPortraitOverrides : fighterDisplayOverrides)[fighter.id];
  if (override) return override.startsWith('/') ? `${import.meta.env.BASE_URL}${override.slice(1)}` : override;
  const files = isPortrait ? availableFighterPortraitSvgs : availableFighterDisplaySvgs;
  const matches = files
    .map((url) => ({ url, relevance: score(url, fighter) }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.url.length - b.url.length);
  if (matches.length) return `${import.meta.env.BASE_URL}${matches[0].url.slice(1)}`;
  // Use the original supplied E. Honda reference only for large displays.
  return !isPortrait && fighter.isReferenceArt ? `${import.meta.env.BASE_URL}assets/honda-reference.webp` : null;
}
