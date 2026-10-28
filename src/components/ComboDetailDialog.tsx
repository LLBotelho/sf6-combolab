import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ComboSequence } from './CommandToken';
import type { Combo } from '../types';

export function ComboDetailDialog({ combo, onClose }: { combo: Combo; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') { event.preventDefault(); closeButton.current?.focus(); }
    };
    document.addEventListener('keydown', onEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onEscape); };
  }, [onClose]);

  return <div className="combo-detail-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="combo-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="combo-detail-title">
      <header><div><span className="eyebrow">SEQUÊNCIA COMPLETA / {combo.category.toUpperCase()}</span><h2 id="combo-detail-title">{combo.name}</h2></div><button ref={closeButton} type="button" className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><X size={22}/></button></header>
      <div className="combo-detail-content"><div className="combo-detail-overline">{combo.steps.length} COMANDOS{combo.damage === null ? '' : ` · ${combo.damage.toLocaleString('pt-BR')} DANO`}</div>
        <div className="combo-detail-sequence"><ComboSequence steps={combo.steps}/></div>
        {combo.tags.length > 0 && <div className="combo-detail-tags">{combo.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}
        {combo.notes && <><h3>ANOTAÇÕES</h3><p className="combo-detail-notes">{combo.notes}</p></>}
      </div>
    </section>
  </div>;
}
