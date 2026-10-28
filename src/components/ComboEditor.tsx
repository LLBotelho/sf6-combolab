import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronLeft, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { commands, commandGroups, categories, tags, commandMap } from '../data/commands';
import { useCollection } from '../hooks/useCollection';
import { CommandIcon, CommandToken } from './CommandToken';
import type { Combo, ComboCategory, ComboStep, ComboTag, CommandGroup } from '../types';

export function ComboEditor({ fighterId, combo, initialCategory, onClose }: {
  fighterId: string;
  combo?: Combo;
  initialCategory: ComboCategory;
  onClose: () => void;
}) {
  const { upsertCombo } = useCollection();
  const [name, setName] = useState(combo?.name ?? 'Novo combo');
  const [category, setCategory] = useState<ComboCategory>(combo?.category ?? initialCategory);
  const [selectedTags, setSelectedTags] = useState<ComboTag[]>(combo?.tags ?? []);
  const [steps, setSteps] = useState<ComboStep[]>(combo?.steps ?? []);
  const [notes, setNotes] = useState(combo?.notes ?? '');
  const [damage, setDamage] = useState(combo?.damage === null || combo?.damage === undefined ? '' : String(combo.damage));
  const [activeGroup, setActiveGroup] = useState<CommandGroup>('attack');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const changed = dirty;
        if (!changed || window.confirm('Descartar alterações deste combo?')) onClose();
      }
    };
    document.addEventListener('keydown', listener);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', listener); document.body.style.overflow = oldOverflow; };
  }, [dirty, onClose]);

  const change = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => { setter(value); setDirty(true); };
  function add(key: string) {
    setSteps((previous) => [...previous, { id: crypto.randomUUID(), key }]);
    setDirty(true);
  }
  function remove(id: string) {
    setSteps((previous) => previous.filter((step) => step.id !== id));
    setSelectedStep(null);
    setDirty(true);
  }
  function swap(id: string, direction: -1 | 1) {
    setSteps((previous) => {
      const i = previous.findIndex((step) => step.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= previous.length) return previous;
      const next = [...previous];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  }
  function toggleTag(tag: ComboTag) {
    change(setSelectedTags, selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]);
  }
  function close() { if (!dirty || window.confirm('Descartar alterações deste combo?')) onClose(); }
  function save() {
    if (!name.trim()) { window.alert('Informe o nome do combo.'); return; }
    if (steps.length === 0) { window.alert('Adicione ao menos um comando antes de salvar.'); return; }
    const numericDamage = damage.trim() === '' ? null : Number(damage);
    if (numericDamage !== null && (!Number.isFinite(numericDamage) || numericDamage < 0)) { window.alert('Dano inválido.'); return; }
    const now = new Date().toISOString();
    upsertCombo({ id: combo?.id ?? crypto.randomUUID(), characterId: fighterId,
      name: name.trim(), category, tags: selectedTags, damage: numericDamage,
      notes: notes.trim(), steps, createdAt: combo?.createdAt ?? now, updatedAt: now });
    onClose();
  }

  const selectedIndex = steps.findIndex((step) => step.id === selectedStep);
  return <div className="editor-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-heading">
      <header className="editor-header">
        <div><span className="eyebrow">COMBO WORKSHOP / {combo ? 'EDIT MODE' : 'CREATE MODE'}</span><h2 id="editor-heading">{combo ? 'EDITAR COMBO' : 'NOVO COMBO'}<span className="heading-dot">.</span></h2></div>
        <button type="button" className="icon-button editor-close" onClick={close} aria-label="Fechar editor"><X size={22}/></button>
      </header>
      <div className="editor-content">
        <div className="editor-left">
          <div className="editor-section-heading"><span>01 / SEQUÊNCIA</span><span>{steps.length} COMANDOS</span></div>
          <div className="editor-preview">
            {steps.length ? <div className="preview-steps" aria-label="Prévia dos comandos">
              {steps.map((step, i) => <button key={step.id} type="button" className={`preview-step ${selectedStep === step.id ? 'preview-step--selected' : ''}`} onClick={() => setSelectedStep(step.id)} aria-label={`Selecionar comando ${i + 1}: ${commandMap.get(step.key)?.label ?? step.key}`} title="Clique para selecionar, editar ou remover"><CommandToken step={step}/><span className="step-index">{i + 1}</span></button>)}
            </div> : <div className="preview-placeholder"><span>READY?</span><p>Selecione comandos na biblioteca abaixo para montar seu combo.</p></div>}
          </div>
          <div className="step-toolbar">
            <span>{selectedIndex >= 0 ? `Comando ${selectedIndex + 1}: ${commandMap.get(steps[selectedIndex].key)?.label ?? ''}` : 'Selecione um comando para reorganizar'}</span>
            <div><button className="icon-button" type="button" disabled={selectedIndex <= 0} onClick={() => swap(selectedStep!, -1)} title="Mover para esquerda" aria-label="Mover para esquerda"><ArrowUp size={16} className="rotate-minus"/></button>
              <button className="icon-button" type="button" disabled={selectedIndex < 0 || selectedIndex === steps.length - 1} onClick={() => swap(selectedStep!, 1)} title="Mover para direita" aria-label="Mover para direita"><ArrowDown size={16} className="rotate-minus"/></button>
              <button className="icon-button danger-text" type="button" disabled={selectedIndex < 0} onClick={() => remove(selectedStep!)} title="Remover comando" aria-label="Remover comando"><Trash2 size={16}/></button></div>
          </div>
          <div className="editor-section-heading library-title"><span>02 / BIBLIOTECA DE COMANDOS</span><span>CLIQUE PARA ADICIONAR</span></div>
          <div className="command-tabs" role="tablist" aria-label="Tipos de comando">
            {commandGroups.map((group) => <button type="button" role="tab" aria-selected={activeGroup === group.key} key={group.key} onClick={() => setActiveGroup(group.key)} className={activeGroup === group.key ? 'tab-active' : ''}>{group.label}</button>)}
          </div>
          <div className="command-grid">
            {commands.filter((command) => command.group === activeGroup).map((command) => <button type="button" key={command.key} className="command-picker" onClick={() => add(command.key)} title={`Adicionar ${command.label}`}>
              <CommandIcon command={command} size="large"/><span className="command-picker-label">{command.label}</span><small>{command.subtitle}</small>
            </button>)}
          </div>
          <div className="editor-hint"><RotateCcw size={15}/> As direções de frente/trás consideram o personagem olhando para a direita (lado 1).</div>
        </div>
        <aside className="editor-right">
          <div className="editor-section-heading"><span>03 / DETALHES</span></div>
          <label className="field-label" htmlFor="combo-name">NOME DO COMBO</label>
          <input id="combo-name" className="field-input" value={name} maxLength={150} onChange={(event) => change(setName, event.target.value)} placeholder="Ex.: BnB midscreen" />
          <label className="field-label" htmlFor="combo-category">CATEGORIA</label>
          <select id="combo-category" className="field-input" value={category} onChange={(event) => change(setCategory, event.target.value as ComboCategory)}>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <label className="field-label" htmlFor="combo-damage">DANO <span>(OPCIONAL)</span></label>
          <input id="combo-damage" className="field-input" value={damage} type="number" min={0} step={1} onChange={(event) => change(setDamage, event.target.value)} placeholder="Ex.: 3250" />
          <label className="field-label">ETIQUETAS</label>
          <div className="tag-picker">{tags.map((tag) => <button type="button" key={tag} onClick={() => toggleTag(tag)} className={selectedTags.includes(tag) ? 'tag-choice tag-choice--active' : 'tag-choice'} aria-pressed={selectedTags.includes(tag)}>{selectedTags.includes(tag) ? <Check size={14}/> : <span className="tag-choice-circle"/>}{tag}</button>)}</div>
          <label className="field-label" htmlFor="combo-notes">ANOTAÇÕES <span>(OPCIONAL)</span></label>
          <textarea id="combo-notes" className="field-input field-textarea" rows={4} maxLength={4000} value={notes} onChange={(event) => change(setNotes, event.target.value)} placeholder="Distância, timing, condições de acerto..." />
          <div className="editor-right-bottom"><div className="editor-save-tip"><span className="tip-indicator"/> Salvo apenas neste navegador. Exporte backups em Configurações.</div>
            <button type="button" onClick={save} className="primary-button save-button"><Save size={18}/> SALVAR COMBO <ChevronLeft size={18} className="flip-chevron"/></button>
            <button type="button" onClick={close} className="cancel-button">CANCELAR</button></div>
        </aside>
      </div>
    </section>
  </div>;
}
