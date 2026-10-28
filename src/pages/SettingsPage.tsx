import { useRef, useState } from 'react';
import { Upload, Download, ShieldCheck, Cloud, AlertTriangle, HardDriveDownload, RotateCcw } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { data, exportData, importData, importLegacyData, recoverDraft, syncState, hasLegacyData, hasDraft } = useCollection();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function handleFile(file: File | undefined) {
    if (!file) return;
    try { await importData(file); setMessage('Importação solicitada. Aguarde o indicador de sincronização antes de fechar.'); }
    catch (err: unknown) { setMessage(err instanceof Error ? err.message : 'Falha ao importar o arquivo.'); }
    finally { if (inputRef.current) inputRef.current.value = ''; }
  }
  function importLocal() {
    try { importLegacyData(); setMessage('Migração solicitada. Confira o status de sincronização no cabeçalho.'); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Não foi possível migrar.'); }
  }
  function restoreDraft() {
    try { recoverDraft(); setMessage('Recuperação solicitada. Confira o status de sincronização no cabeçalho.'); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Não foi possível recuperar.'); }
  }
  return <main className="settings-page"><span className="eyebrow">SYSTEM / CLOUD ACCOUNT</span><h1>CONFIGURAÇÕES<span className="heading-dot">.</span></h1><p>Sua coleção pertence à conta <strong>{user?.email}</strong>. Cada jogador vê somente os próprios dados.</p>
    <div className="settings-grid">
      <article className="settings-card"><Cloud size={28}/><h2>SINCRONIZAÇÃO NA NUVEM</h2><p>Dados salvos no Supabase, acessíveis de outros dispositivos após login.</p><div className="settings-summary"><span>{data.mains.length} personagens favoritos</span><span>{data.combos.length} combos</span><span>Estado: {syncState === 'saved' ? 'sincronizado' : syncState === 'saving' ? 'salvando...' : 'atenção necessária'}</span></div></article>
      <article className="settings-card"><Download size={28}/><h2>EXPORTAR BACKUP</h2><p>Baixe uma cópia JSON da coleção. Guarde um backup antes de importar arquivos.</p><button type="button" className="primary-button" onClick={exportData}><Download size={17}/> BAIXAR JSON</button></article>
      <article className="settings-card"><Upload size={28}/><h2>IMPORTAR BACKUP</h2><p>Substitui os dados desta conta por um JSON validado, após confirmação.</p><input ref={inputRef} type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])}/><button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}><Upload size={17}/> SELECIONAR ARQUIVO</button></article>
      {hasLegacyData && <article className="settings-card"><HardDriveDownload size={28}/><h2>MIGRAR DADOS ANTIGOS</h2><p>Encontramos favoritos ou combos da versão local neste navegador. Importar não apaga o backup original.</p><button type="button" className="secondary-button" onClick={importLocal}><HardDriveDownload size={17}/> IMPORTAR DADOS LOCAIS</button></article>}
      {hasDraft && <article className="settings-card"><RotateCcw size={28}/><h2>RASCUNHO NÃO SINCRONIZADO</h2><p>Encontramos alterações pendentes neste navegador. A recuperação substitui a coleção atual após confirmação.</p><button type="button" className="secondary-button" onClick={restoreDraft}><RotateCcw size={17}/> RECUPERAR RASCUNHO</button></article>}
    </div>
    {message && <p role="status" className="settings-message">{message}</p>}
    <div className="settings-notes"><p><ShieldCheck size={19}/> Contas separadas por autenticação e políticas de acesso no banco.</p><p><AlertTriangle size={19}/> Em caso de erro de sincronização, exporte seu backup antes de recarregar ou sair.</p></div>
  </main>;
}
