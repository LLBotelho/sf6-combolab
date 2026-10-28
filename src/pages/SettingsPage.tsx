import { useRef, useState } from 'react';
import { Upload, Download, ShieldCheck, HardDrive, AlertTriangle } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';

export function SettingsPage() {
  const { data, exportData, importData } = useCollection();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function handleFile(file: File | undefined) {
    if (!file) return;
    try { await importData(file); setMessage('Importação concluída, ou cancelada sem alterações.'); }
    catch (err: unknown) { setMessage(err instanceof Error ? err.message : 'Falha ao importar o arquivo.'); }
    finally { if (inputRef.current) inputRef.current.value = ''; }
  }
  return <main className="settings-page"><span className="eyebrow">SYSTEM / LOCAL DATA</span><h1>CONFIGURAÇÕES<span className="heading-dot">.</span></h1><p>Todos os seus dados permanecem neste navegador e podem ser exportados para um arquivo.</p>
    <div className="settings-grid"><article className="settings-card"><HardDrive size={28}/><h2>ARMAZENAMENTO LOCAL</h2><p>Sem conta, nuvem ou assinatura. Os dados são separados por navegador e dispositivo.</p><div className="settings-summary"><span>{data.mains.length} personagens favoritos</span><span>{data.combos.length} combos</span></div></article><article className="settings-card"><Download size={28}/><h2>EXPORTAR BACKUP</h2><p>Baixe um JSON com seus personagens favoritos, comandos, categorias, etiquetas e notas.</p><button type="button" className="primary-button" onClick={exportData}><Download size={17}/> BAIXAR JSON</button></article><article className="settings-card"><Upload size={28}/><h2>IMPORTAR BACKUP</h2><p>Carregue um backup salvo. O arquivo será validado antes de substituir os dados atuais.</p><input ref={inputRef} type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])}/><button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}><Upload size={17}/> SELECIONAR ARQUIVO</button></article></div>
    {message && <p role="status" className="settings-message">{message}</p>}
    <div className="settings-notes"><p><ShieldCheck size={19}/> Importações são verificadas. A substituição precisa ser confirmada.</p><p><AlertTriangle size={19}/> Limpar o armazenamento do navegador pode excluir os combos: faça backups regularmente.</p></div>
  </main>;
}
