import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { downloadBackup, emptyData, loadAppData, parseAppData } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { AppData, Combo } from '../types';

type SyncState = 'loading' | 'saved' | 'saving' | 'error';
type CollectionContextValue = {
  data: AppData;
  loading: boolean;
  syncState: SyncState;
  warning: string | null;
  dismissWarning: () => void;
  isMain: (characterId: string) => boolean;
  toggleMain: (characterId: string) => void;
  upsertCombo: (combo: Combo) => void;
  duplicateCombo: (combo: Combo) => void;
  deleteCombo: (comboId: string) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  importLegacyData: () => void;
  recoverDraft: () => void;
  hasLegacyData: boolean;
  hasDraft: boolean;
};
const Context = createContext<CollectionContextValue | null>(null);
const draftKey = (userId: string) => `sf6.cloud.unsynced.${userId}`;

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) throw new Error('CollectionProvider requer sessão autenticada');
  const userId = user.id;
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [warning, setWarning] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const lastQueued = useRef<AppData | null>(null);
  const revision = useRef<number | null>(null);
  const pending = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const blocked = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    async function load() {
      try {
        const { data: access, error: accessError } = await supabase.from('allowed_players')
          .select('user_id').eq('user_id', userId).maybeSingle();
        if (accessError) throw accessError;
        if (!access) throw new Error('Sua conta ainda não foi liberada para o ComboLab. Peça ao administrador para autorizar seu usuário no Supabase.');
        const { data: record, error } = await supabase.from('user_playbooks')
          .select('data, revision').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const incoming = record ? parseAppData(record.data) : emptyData();
        revision.current = record ? Number(record.revision) : null;
        lastQueued.current = incoming;
        setData(incoming);
        setLoading(false);
        setSyncState('saved');
        try {
          const draft = localStorage.getItem(draftKey(userId));
          setHasDraft(Boolean(draft));
          if (draft) setWarning('Há alterações não sincronizadas neste navegador. Recupere-as em Configurações antes de continuar editando.');
          const legacy = loadAppData();
          setHasLegacyData(legacy.data.mains.length > 0 || legacy.data.combos.length > 0);
        } catch { /* browser storage optional */ }
      } catch (error) {
        if (cancelled) return;
        setSyncState('error');
        setWarning(error instanceof Error && error.message.includes('ainda não foi liberada') ? error.message : 'Não foi possível carregar seus dados da nuvem. Verifique a conexão e as permissões.');
        // Never allow edits before loading succeeds: that would risk overwriting cloud data.
      }
    }
    void load();
    return () => { cancelled = true; alive.current = false; };
  }, [userId]);

  useEffect(() => {
    if (loading || lastQueued.current === data) return;
    lastQueued.current = data;
    if (blocked.current) return;
    try { localStorage.setItem(draftKey(userId), JSON.stringify(data)); setHasDraft(true); }
    catch { setWarning('Não foi possível manter uma cópia local enquanto sincroniza.'); }
    pending.current += 1;
    setSyncState('saving');
    queue.current = queue.current.then(async () => {
      if (blocked.current) return;
      if (revision.current === null) {
        const { data: inserted, error } = await supabase.from('user_playbooks')
          .insert({ user_id: userId, data, revision: 0 })
          .select('revision').single();
        if (error || !inserted) throw new Error('Não foi possível criar sua coleção. Se outra sessão já criou os dados, recarregue antes de editar.');
        revision.current = Number(inserted.revision);
      } else {
        const nextRevision = revision.current + 1;
        const { data: updated, error } = await supabase.from('user_playbooks')
          .update({ data, revision: nextRevision })
          .eq('user_id', userId).eq('revision', revision.current)
          .select('revision').maybeSingle();
        if (error || !updated) throw new Error('Conflito de sincronização: outra sessão alterou sua coleção. Exporte o rascunho em Configurações e recarregue antes de tentar novamente.');
        revision.current = Number(updated.revision);
      }
    }).then(() => {
      pending.current -= 1;
      if (pending.current === 0 && alive.current && !blocked.current) {
        try { localStorage.removeItem(draftKey(userId)); setHasDraft(false); } catch { /* ignored */ }
        setSyncState('saved');
      }
    }).catch((error: unknown) => {
      blocked.current = true;
      if (alive.current) {
        setSyncState('error');
        setWarning(error instanceof Error ? error.message : 'Não foi possível sincronizar os dados. Exporte um backup antes de recarregar.');
      }
    });
  }, [data, loading, userId]);

  const commit = useCallback((updater: (previous: AppData) => AppData) => {
    if (!blocked.current && !loading) setData(updater);
  }, [loading]);
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
      steps: combo.steps.map((step) => ({ ...step, id: crypto.randomUUID() })), createdAt: now, updatedAt: now });
  }
  function deleteCombo(comboId: string) {
    commit((previous) => ({ ...previous, combos: previous.combos.filter((combo) => combo.id !== comboId) }));
  }
  async function importData(file: File) {
    if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo excede 10 MB.');
    let value: unknown;
    try { value = JSON.parse(await file.text()) as unknown; }
    catch { throw new Error('O arquivo selecionado não é um JSON válido.'); }
    const incoming = parseAppData(value);
    if (!window.confirm(`Substituir os dados da sua conta na nuvem por ${incoming.combos.length} combos importados? Exporte um backup antes.`)) return;
    if (blocked.current) throw new Error('A sincronização está bloqueada. Exporte seus dados e recarregue antes de importar.');
    commit(() => incoming);
  }
  function importLegacyData() {
    const legacy = loadAppData();
    if (!legacy.data.combos.length && !legacy.data.mains.length) throw new Error('Não existem dados antigos válidos neste navegador.');
    if (!window.confirm(`Migrar ${legacy.data.combos.length} combos e ${legacy.data.mains.length} favoritos do armazenamento antigo? Isso substituirá a coleção atual desta conta na nuvem, mas preservará os dados locais.`)) return;
    if (blocked.current) throw new Error('Resolva o erro de sincronização antes de importar.');
    commit(() => legacy.data);
  }
  function recoverDraft() {
    const raw = localStorage.getItem(draftKey(userId));
    if (!raw) throw new Error('Nenhum rascunho encontrado.');
    const backup = parseAppData(JSON.parse(raw) as unknown);
    if (!window.confirm('Restaurar rascunho não sincronizado? Isso substituirá os dados atuais da conta. Faça backup antes.')) return;
    if (blocked.current) throw new Error('Recarregue a página para tentar recuperar o rascunho.');
    commit(() => backup);
    setWarning(null);
  }
  return <Context.Provider value={{ data, loading, syncState, warning,
    dismissWarning: () => setWarning(null), isMain, toggleMain, upsertCombo,
    duplicateCombo, deleteCombo, exportData: () => downloadBackup(data), importData,
    importLegacyData, recoverDraft, hasLegacyData, hasDraft,
  }}>{loading ? <main className="cloud-loading">{syncState === 'error' ? <><p role="alert">{warning}</p><button className="primary-button" onClick={() => window.location.reload()}>TENTAR NOVAMENTE</button></> : <p>CARREGANDO SUA COLEÇÃO...</p>}</main> : children}</Context.Provider>;
}

export function useCollection(): CollectionContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('useCollection requer CollectionProvider');
  return value;
}
