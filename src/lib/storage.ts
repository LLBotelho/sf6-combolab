import { categories, commandMap, tags } from '../data/commands';
import { fighters } from '../data/characters';
import type { AppData, Combo, ComboStep } from '../types';

export const STORAGE_KEY = 'sf6.combo.builder.v1';
export const emptyData = (): AppData => ({ version: 1, mains: [], combos: [] });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function parseAppData(value: unknown): AppData {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.mains) || !Array.isArray(value.combos)) {
    throw new Error('O arquivo não contém um backup v1 válido.');
  }
  if (value.mains.length > 200 || value.combos.length > 30000) {
    throw new Error('Arquivo maior que o limite de segurança.');
  }
  const knownFighters = new Set(fighters.map((fighter) => fighter.id));
  if (value.mains.some((id) => typeof id !== 'string' || !knownFighters.has(id))) {
    throw new Error('O backup contém um Main desconhecido.');
  }
  const mains = [...new Set(value.mains as string[])];
  const seen = new Set<string>();
  const combos: Combo[] = value.combos.map((raw: unknown) => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id || seen.has(raw.id) ||
      typeof raw.characterId !== 'string' || !knownFighters.has(raw.characterId) ||
      typeof raw.name !== 'string' || raw.name.length > 150 ||
      !categories.includes(raw.category as Combo['category']) ||
      typeof raw.notes !== 'string' || raw.notes.length > 4000 ||
      !Array.isArray(raw.tags) || raw.tags.some((tag: unknown) => !tags.includes(tag as Combo['tags'][number])) ||
      (raw.damage !== null && (typeof raw.damage !== 'number' || !Number.isFinite(raw.damage) || raw.damage < 0)) ||
      typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string' ||
      !Array.isArray(raw.steps) || raw.steps.length > 300) {
      throw new Error('Backup contém um combo inválido.');
    }
    if (raw.steps.some((step: unknown) => !isRecord(step) || typeof step.id !== 'string' || typeof step.key !== 'string' || !commandMap.has(step.key))) {
      throw new Error('Backup contém um comando não reconhecido.');
    }
    const stepIds = (raw.steps as ComboStep[]).map((s) => s.id);
    if (new Set(stepIds).size !== stepIds.length) throw new Error('Há comandos com IDs duplicados.');
    seen.add(raw.id);
    return {
      id: raw.id, characterId: raw.characterId, name: raw.name,
      category: raw.category as Combo['category'], notes: raw.notes,
      tags: [...new Set(raw.tags as Combo['tags'])], damage: raw.damage as number | null,
      steps: (raw.steps as ComboStep[]).map((step) => ({ id: step.id, key: step.key })),
      createdAt: raw.createdAt, updatedAt: raw.updatedAt,
    };
  });
  return { version: 1, mains, combos };
}

export function loadAppData(): { data: AppData; warning: string | null } {
  try {
    const content = localStorage.getItem(STORAGE_KEY);
    if (!content) return { data: emptyData(), warning: null };
    return { data: parseAppData(JSON.parse(content) as unknown), warning: null };
  } catch {
    // Do not silently destroy an unreadable store: copy raw bytes for recovery.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localStorage.setItem(`${STORAGE_KEY}.recovery.${Date.now()}`, raw);
    } catch { /* storage may be unavailable */ }
    return { data: emptyData(), warning: 'Dados antigos inválidos: uma cópia de recuperação foi preservada no armazenamento local, se disponível.' };
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function downloadBackup(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = url;
  element.download = `sf6-combos-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(element);
  element.click();
  element.remove();
  URL.revokeObjectURL(url);
}
