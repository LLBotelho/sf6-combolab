import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { downloadBackup, loadAppData, parseAppData, saveAppData } from '../lib/storage';
import type { AppData, Combo } from '../types';

interface CollectionContextValue {
  data: AppData;
  warning: string | null;
  dismissWarning: () => void;
  isMain: (characterId: string) => boolean;
  toggleMain: (characterId: string) => void;
  upsertCombo: (combo: Combo) => void;
  duplicateCombo: (combo: Combo) => void;
  deleteCombo: (comboId: string) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadAppData);
  const [data, setData] = useState<AppData>(initial.data);
  const [warning, setWarning] = useState<string | null>(initial.warning);
  const previousSaved = useRef(data);

  // Persist after React commits the state; do not perform side effects in an updater.
  // No initial write: preserves a corrupted original long enough to be recovered.
  useEffect(() => {
    if (previousSaved.current === data) return;
    previousSaved.current = data;
    try { saveAppData(data); setWarning(null); }
    catch { setWarning('Não foi possível salvar no navegador. Exporte seus dados e confira o espaço disponível.'); }
  }, [data]);

  function commit(next: (previous: AppData) => AppData) {
    setData(next);
  }

  const isMain = (characterId: string) => data.mains.includes(characterId);
  function toggleMain(characterId: string) {
    commit((previous) => ({ ...previous, mains: previous.mains.includes(characterId)
      ? previous.mains.filter((id) => id !== characterId)
      : [...previous.mains, characterId] }));
  }
  function upsertCombo(combo: Combo) {
    commit((previous) => ({ ...previous, combos: previous.combos.some((existing) => existing.id === combo.id)
      ? previous.combos.map((existing) => existing.id === combo.id ? combo : existing)
      : [...previous.combos, combo] }));
  }
  function duplicateCombo(combo: Combo) {
    const now = new Date().toISOString();
    upsertCombo({ ...combo, id: crypto.randomUUID(), name: `${combo.name} (cópia)`,
      steps: combo.steps.map((step) => ({ ...step, id: crypto.randomUUID() })),
      createdAt: now, updatedAt: now });
  }
  function deleteCombo(comboId: string) {
    commit((previous) => ({ ...previous, combos: previous.combos.filter((combo) => combo.id !== comboId) }));
  }
  async function importData(file: File) {
    if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo excede 10 MB.');
    const text = await file.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text) as unknown; }
    catch { throw new Error('O arquivo não é um JSON válido.'); }
    const incoming = parseAppData(parsed);
    if (!window.confirm(`Importar ${incoming.combos.length} combos e substituir todos os dados locais? Faça uma exportação antes se necessário.`)) return;
    try { saveAppData(incoming); }
    catch { throw new Error('Falha ao gravar o backup no navegador.'); }
    setData(incoming);
    setWarning(null);
  }

  return <CollectionContext.Provider value={{
    data, warning, dismissWarning: () => setWarning(null), isMain, toggleMain,
    upsertCombo, duplicateCombo, deleteCombo, exportData: () => downloadBackup(data), importData,
  }}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const value = useContext(CollectionContext);
  if (!value) throw new Error('useCollection requer CollectionProvider');
  return value;
}
