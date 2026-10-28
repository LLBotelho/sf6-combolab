import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Heart, Plus, Search, SlidersHorizontal, Star } from 'lucide-react';
import { categories, tags } from '../data/commands';
import { getFighter } from '../data/characters';
import { useCollection } from '../hooks/useCollection';
import { FighterArtwork } from '../components/FighterArtwork';
import { PaginatedComboList } from '../components/PaginatedComboList';
import { ComboEditor } from '../components/ComboEditor';
import type { Combo, ComboCategory, ComboTag } from '../types';

export function FighterPage() {
  const { characterId } = useParams();
  const fighter = getFighter(characterId ?? '');
  const { data, isMain, toggleMain } = useCollection();
  const [category, setCategory] = useState<ComboCategory | 'all'>('all');
  const [tag, setTag] = useState<ComboTag | 'all'>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Combo | 'new' | null>(null);
  const [filterVersion, setFilterVersion] = useState(0);

  const allCombos = useMemo(() => data.combos.filter((combo) => combo.characterId === characterId), [data.combos, characterId]);
  const filtered = useMemo(() => allCombos.filter((combo) =>
    (category === 'all' || combo.category === category) &&
    (tag === 'all' || combo.tags.includes(tag)) &&
    `${combo.name} ${combo.notes}`.toLowerCase().includes(query.trim().toLowerCase())), [allCombos, category, tag, query]);

  if (!fighter) return <main className="not-found"><h1>LUTADOR NÃO ENCONTRADO</h1><Link to="/" className="primary-button"><ArrowLeft size={16}/> VOLTAR AO ROSTER</Link></main>;

  const main = isMain(fighter.id);
  const favorites = allCombos.filter((combo) => combo.tags.includes('Favorito')).length;
  const categoriesUsed = categories.filter((entry) => allCombos.some((combo) => combo.category === entry)).length;
  const editCombo = editing && editing !== 'new' ? editing : undefined;
  const resetPages = () => setFilterVersion((value) => value + 1);

  return <main className="fighter-page fighter-page--playbook" style={{ '--fighter-color': fighter.hue } as CSSProperties}>
    <aside className="fighter-showcase" aria-label={`Personagem: ${fighter.name}`}>
      <div className="showcase-art" key={fighter.id}><FighterArtwork fighter={fighter} variant="stage"/></div>
      <div className="showcase-top">
        <Link to="/" className="showcase-back"><ArrowLeft size={15}/> CHARACTER SELECT</Link>
        <span className="eyebrow">FIGHTER PROFILE / {fighter.title.toUpperCase()}</span>
      </div>
      <div className="showcase-bottom">
        <div className="showcase-number">YOUR FIGHTER / {fighter.name.toUpperCase()}</div>
        <h1>{fighter.name.toUpperCase()}<span className="heading-dot">.</span></h1>
        <div className="showcase-stats">
          <div><strong>{String(allCombos.length).padStart(2, '0')}</strong><span>COMBOS</span></div>
          <div><strong>{String(favorites).padStart(2, '0')}</strong><span>FAVORITOS</span></div>
          <div><strong>{String(categoriesUsed).padStart(2, '0')}</strong><span>CATEGORIAS</span></div>
        </div>
      </div>
    </aside>

    <section className="playbook-panel" aria-label={`Combos de ${fighter.name}`}>
      <header className="playbook-header">
        <div className="playbook-titles">
          <span className="eyebrow">YOUR PLAYBOOK / {fighter.name.toUpperCase()}</span>
          <h2>SEUS COMBOS<span className="heading-dot">.</span></h2>
          <p>Todos os combos em um só lugar. Filtre, navegue e treine.</p>
        </div>
        <div className="playbook-actions">
          <button type="button" onClick={() => toggleMain(fighter.id)} className="secondary-button main-toggle" aria-pressed={main}><Star size={15} fill={main ? 'currentColor' : 'none'}/>{main ? 'NOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}</button>
          <button type="button" onClick={() => setEditing('new')} className="primary-button"><Plus size={17}/> NOVO COMBO</button>
        </div>
      </header>

      <div className="playbook-toolbar">
        <label className="category-select" htmlFor="playbook-category"><SlidersHorizontal size={16}/><span className="sr-only">Filtrar categoria</span><select id="playbook-category" value={category} onChange={(event) => { setCategory(event.target.value as ComboCategory | 'all'); resetPages(); }}>
          <option value="all">Todas as categorias ({allCombos.length})</option>
          {categories.map((item) => <option key={item} value={item}>{item} ({allCombos.filter((combo) => combo.category === item).length})</option>)}
        </select><ChevronDown size={15} className="category-chevron"/></label>
        <label className="combo-search" htmlFor="playbook-search"><Search size={16}/><input id="playbook-search" aria-label="Pesquisar combos" value={query} placeholder="Buscar combos..." onChange={(event) => { setQuery(event.target.value); resetPages(); }}/></label>
      </div>
      <div className="playbook-tags" role="group" aria-label="Filtrar etiquetas"><div className="tag-filters">
        <button type="button" className={tag === 'all' ? 'tag-filter-active' : ''} onClick={() => { setTag('all'); resetPages(); }}>TODOS</button>
        {tags.map((item) => <button type="button" key={item} className={tag === item ? 'tag-filter-active' : ''} onClick={() => { setTag(item); resetPages(); }}>{item === 'Favorito' && <Heart size={12}/>} {item.toUpperCase()}</button>)}
      </div><span className="playbook-count">{filtered.length} DE {allCombos.length} COMBOS</span></div>

      <PaginatedComboList
        combos={filtered}
        resetKey={`${fighter.id}-${filterVersion}`}
        hasAnyCombos={allCombos.length > 0}
        onEdit={setEditing}
        onCreate={() => setEditing('new')}
      />
    </section>
    {editing && <ComboEditor key={editCombo?.id ?? 'new'} fighterId={fighter.id} combo={editCombo} initialCategory={category === 'all' ? 'Basic combos' : category} onClose={() => setEditing(null)}/>}
  </main>;
}
