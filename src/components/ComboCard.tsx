import { Copy, Pencil, Trash2, Heart, Zap, Gauge, Eye } from 'lucide-react';
import { ComboSequence } from './CommandToken';
import { useCollection } from '../hooks/useCollection';
import type { Combo, ComboTag } from '../types';

const TagIcon = ({ tag }: { tag: ComboTag }) => tag === 'Favorito' ? <Heart size={12} fill="currentColor"/> : tag === 'Mais Fácil' ? <Gauge size={12}/> : <Zap size={12}/>;

export function ComboCard({ combo, index, onEdit, onView, compact = false }: { combo: Combo; index: number; onEdit: (combo: Combo) => void; onView?: (combo: Combo) => void; compact?: boolean }) {
  const { upsertCombo, duplicateCombo, deleteCombo } = useCollection();
  const favorite = combo.tags.includes('Favorito');
  function toggleFavorite() {
    upsertCombo({ ...combo, tags: favorite ? combo.tags.filter((tag) => tag !== 'Favorito') : [...combo.tags, 'Favorito'], updatedAt: new Date().toISOString() });
  }
  return <article className={compact ? "combo-card combo-card--compact" : "combo-card"}>
    <div className="combo-card-head">
      <span className="combo-number">{String(index+1).padStart(2,'0')}</span>
      <div className="combo-heading"><h3>{combo.name}</h3><span className="combo-meta">{combo.steps.length} COMANDOS {compact && <>· {combo.category.toUpperCase()} </>}{combo.damage !== null && <> · {combo.damage.toLocaleString('pt-BR')} DANO</>}</span></div>
      <div className="combo-actions">
        <button className={`icon-button ${favorite ? 'favorite-on' : ''}`} onClick={toggleFavorite} title={favorite ? 'Desfavoritar' : 'Favoritar'} aria-label={favorite ? 'Desfavoritar' : 'Favoritar'}><Heart size={17} fill={favorite ? 'currentColor' : 'none'}/></button>
        <button className="icon-button" onClick={() => onEdit(combo)} title="Editar" aria-label={`Editar ${combo.name}`}><Pencil size={16}/></button>
        <button className="icon-button" onClick={() => duplicateCombo(combo)} title="Duplicar" aria-label={`Duplicar ${combo.name}`}><Copy size={16}/></button>
        <button className="icon-button" onClick={() => { if (window.confirm(`Excluir o combo “${combo.name}”?`)) deleteCombo(combo.id); }} title="Excluir" aria-label={`Excluir ${combo.name}`}><Trash2 size={16}/></button>
      </div>
    </div>
    <div className="combo-card-body"><ComboSequence steps={combo.steps} /></div>{onView && <button className="combo-view-full" type="button" onClick={() => onView(combo)}><Eye size={13}/> VER SEQUÊNCIA COMPLETA</button>}
    {(combo.tags.length > 0 || combo.notes) && <div className="combo-card-foot">
      <div className="combo-tags">{combo.tags.map((tag) => <span key={tag} className={`tag tag--${tag === 'Favorito' ? 'favorite' : tag === 'Mais Fácil' ? 'easy' : 'damage'}`}><TagIcon tag={tag}/>{tag}</span>)}</div>
      {combo.notes && <p className="combo-notes">{combo.notes}</p>}
    </div>}
  </article>;
}
