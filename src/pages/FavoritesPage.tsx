import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, Star, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FighterArtwork } from '../components/FighterArtwork';
import { fighters } from '../data/characters';
import { useCollection } from '../hooks/useCollection';
import type { Fighter } from '../types';

const GRID_GAP = 12;

/** Fit a complete number of portrait cards in the available viewport, without a page scrollbar. */
export function calculateFavoritesLayout(width: number, height: number) {
  const columns = width >= 1200 ? 6 : width >= 1000 ? 5 : width >= 760 ? 4 : width >= 520 ? 3 : width >= 310 ? 2 : 1;
  const cardWidth = (Math.max(0, width) - GRID_GAP * (columns - 1)) / columns;
  const desiredHeight = Math.min(260, Math.max(185, Math.round(cardWidth * 1.18)));
  const rows = Math.max(1, Math.floor((Math.max(0, height) + GRID_GAP) / (desiredHeight + GRID_GAP)));
  const cardHeight = Math.max(0, Math.min(desiredHeight, Math.floor((height - GRID_GAP * (rows - 1)) / rows)));
  return { columns, rows, cardHeight, perPage: columns * rows };
}

function FavoriteCard({ fighter, number }: { fighter: Fighter; number: number }) {
  const { data, toggleMain } = useCollection();
  const combos = data.combos.filter((combo) => combo.characterId === fighter.id).length;
  return <article className="favorite-card" style={{ '--fighter-color': fighter.hue } as CSSProperties}>
    <Link to={`/fighter/${fighter.id}`} className="favorite-card-link" aria-label={`Abrir combos de ${fighter.name}`}>
      <FighterArtwork fighter={fighter} variant="portrait" />
      <span className="favorite-card-shade" aria-hidden="true"/>
      <span className="favorite-card-index">{String(number).padStart(2, '0')} / FIGHTER</span>
      <span className="favorite-card-open" aria-hidden="true"><ArrowUpRight size={19}/></span>
    </Link>
    <div className="favorite-card-details">
      <div className="favorite-card-text"><h2>{fighter.name}</h2><p>{combos} {combos === 1 ? 'COMBO SALVO' : 'COMBOS SALVOS'}</p></div>
      <button type="button" onClick={() => toggleMain(fighter.id)} className="favorite-card-remove" aria-label={`Remover ${fighter.name} dos favoritos, preservando seus combos`} title="Remover dos favoritos (combos preservados)"><Star size={17} fill="currentColor"/></button>
    </div>
  </article>;
}

export function FavoritesPage() {
  const { data } = useCollection();
  const [query, setQuery] = useState('');
  const [requestedPage, setRequestedPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 320 });

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;
    const measure = () => setSize((previous) => {
      const width = Math.floor(element.clientWidth);
      const height = Math.floor(element.clientHeight);
      return previous.width === width && previous.height === height ? previous : { width, height };
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = calculateFavoritesLayout(size.width, size.height);
  // Only selected favorites, in the order in which they were added.
  const favorites = useMemo(() => data.mains
    .map((id) => fighters.find((fighter) => fighter.id === id))
    .filter((fighter): fighter is Fighter => Boolean(fighter)), [data.mains]);
  const filtered = useMemo(() => favorites.filter((fighter) =>
    fighter.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [favorites, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / layout.perPage));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * layout.perPage;
  const visible = filtered.slice(start, start + layout.perPage);
  const layoutVars = { '--favorites-columns': layout.columns, '--favorites-card-height': `${layout.cardHeight}px` } as CSSProperties;

  function changeQuery(value: string) { setQuery(value); setRequestedPage(1); }

  return <main className="favorites-page" aria-label="Meus favoritos">
    <header className="favorites-heading">
      <div>
        <span className="eyebrow">YOUR FIGHTERS / PERSONAL COLLECTION</span>
        <h1>MEUS <em>FAVORITOS</em><span className="heading-dot">.</span></h1>
        <p>Sua seleção pessoal de lutadores. Abra um retrato para consultar seus combos.</p>
      </div>
      <div className="favorites-total"><strong>{String(favorites.length).padStart(2, '0')}</strong><span>FIGHTERS<br/>FAVORITOS</span></div>
    </header>

    <div className="favorites-toolbar">
      <span className="favorites-count"><Star size={14} fill="currentColor"/> {filtered.length} {filtered.length === 1 ? 'PERSONAGEM' : 'PERSONAGENS'} NA COLEÇÃO</span>
      <label className="search-box favorites-search"><Search size={17}/><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Buscar favorito..." aria-label="Buscar nos meus favoritos"/>{query && <button type="button" onClick={() => changeQuery('')} aria-label="Limpar busca"><X size={15}/></button>}</label>
    </div>

    <div ref={gridRef} className="favorites-grid-viewport">
      {visible.length > 0 ? <div className="favorites-grid" style={layoutVars}>
        {visible.map((fighter, index) => <FavoriteCard key={fighter.id} fighter={fighter} number={start + index + 1}/>)}
      </div> : <div className="favorites-empty">
        <div className="favorites-empty-icon">{query ? <Search size={34}/> : <Star size={34}/>}</div>
        <h2>{query ? 'NENHUM FAVORITO ENCONTRADO' : 'SUA LISTA DE FAVORITOS ESTÁ VAZIA'}</h2>
        <p>{query ? 'Tente buscar outro nome ou limpe o campo de pesquisa.' : 'Escolha seus lutadores na tela de Personagens e adicione-os aos favoritos.'}</p>
        {query ? <button type="button" className="secondary-button" onClick={() => changeQuery('')}>LIMPAR BUSCA</button> : <Link to="/" className="primary-button"><UserRound size={16}/> ESCOLHER PERSONAGENS</Link>}
      </div>}
    </div>

    <nav className="favorites-pagination" aria-label="Paginação dos favoritos">
      <span className="favorites-range">{filtered.length ? `${start + 1}–${start + visible.length} DE ${filtered.length}` : '0 FAVORITOS'}</span>
      <div className="favorites-page-controls">
        <button type="button" disabled={page <= 1} onClick={() => setRequestedPage(page - 1)} aria-label="Página anterior"><ArrowLeft size={17}/></button>
        <span aria-live="polite">PÁGINA <strong>{String(page).padStart(2,'0')}</strong> / {String(pageCount).padStart(2,'0')}</span>
        <button type="button" disabled={page >= pageCount} onClick={() => setRequestedPage(page + 1)} aria-label="Próxima página"><ArrowRight size={17}/></button>
      </div>
    </nav>
  </main>;
}
