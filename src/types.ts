export type CommandGroup = 'direction' | 'motion' | 'attack' | 'system' | 'separator';

export type ComboCategory =
  | 'Low combos' | 'Basic combos' | 'Punish combos'
  | 'Counter combos' | 'Corner combos' | 'Drive impact combos'
  | 'Drive rush combos' | 'Overdrive combos' | 'Super Art combos';

export type ComboTag = 'Maior Dano' | 'Mais Fácil' | 'Favorito';

export interface CommandDefinition {
  key: string;
  label: string;
  subtitle?: string;
  group: CommandGroup;
  image?: string;
  mirrored?: boolean;
  text?: string;
}

export interface ComboStep {
  id: string;
  key: string;
}

export interface Combo {
  id: string;
  characterId: string;
  name: string;
  category: ComboCategory;
  tags: ComboTag[];
  damage: number | null;
  notes: string;
  steps: ComboStep[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  mains: string[];
  combos: Combo[];
}

export interface Fighter {
  id: string;
  name: string;
  title: string;
  hue: string;
  abbreviation: string;
  isReferenceArt?: boolean;
}
