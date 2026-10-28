import { useMemo, useState } from 'react';
import { ArrowRight, Check, Gamepad2, Plus, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { fighters } from '../data/characters';
import { useCollection } from '../hooks/useCollection';
import { FighterArtwork } from '../components/FighterArtwork';

// Match the order in the character-select reference image without changing saved IDs.
const referenceRosterOrder = [
  'arjun', 'yasmine', 'ingrid', 'alex', 'c-viper', 'sagat', 'elena', 'mai', 'terry', 'm-bison', 'akuma',
  'ed', 'aki', 'rashid', 'cammy', 'lily', 'zangief', 'jp', 'marisa', 'manon', 'dee-jay', 'e-honda',
  'dhalsim', 'blanka', 'ken', 'juri', 'kimberly', 'guile', 'chun-li', 'jamie', 'luke', 'ryu',
];
const homeRoster = [...fighters].sort((a, b) => referenceRosterOrder.indexOf(a.id) - referenceRosterOrder.indexOf(b.id));

/** Character Select. The /mains collection has its own page and pagination. */
export function HomePage() {
  const { data, isMain, toggleMain } = useCollection();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(fighters[0].id);
  const selected = fighters.find((fighter) => fighter.id === selectedId) ?? fighters[0];

  const shown = useMemo(() => homeRoster.filter((fighter) =>
    fighter.name.toLowerCase().includes(query.trim().toLowerCase())), [query]);

    const isSelectedMain = isMain(selected.id);
    const selectedCombos = data.combos.filter((combo) => combo.characterId === selected.id).length;

    return <main className="home-character-select">
      <section className="select-layout" aria-label="Seleção de personagens">
        <div className="select-roster">
          <div className="select-roster-top">
            <div>
              <p className="select-eyebrow"><span className="pulse-dot"/> STREET FIGHTER 6 / ROSTER</p>
              <h2>CHOOSE YOUR <span>FIGHTER.</span></h2>
              <p className="select-roster-help">Selecione um retrato para visualizar o lutador.</p>
            </div>
            <div className="select-roster-count"><strong>{String(shown.length).padStart(2, '0')}</strong><small>FIGHTERS</small></div>
          </div>
          <label className="select-roster-search">
            <Search size={17} aria-hidden="true"/>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar personagem..." aria-label="Buscar personagem"/>
            <span>{String(fighters.length).padStart(2, '0')} TOTAL</span>
          </label>
          <div className="select-roster-grid" aria-label="Escolha um personagem">
            {shown.map((fighter) => {
              const active = selected.id === fighter.id;
              const main = isMain(fighter.id);
              return <button
                key={fighter.id} type="button" onClick={() => setSelectedId(fighter.id)}
                aria-label={`Selecionar ${fighter.name}${main ? ', na sua coleção' : ''}`}
                aria-pressed={active}
                className={`select-fighter ${active ? 'select-fighter--active' : ''}`}
                style={{ '--fighter-color': fighter.hue } as CSSProperties}
                title={`Selecionar ${fighter.name}`}
              >
                <FighterArtwork fighter={fighter} variant="portrait"/>
                <span className="select-fighter-shade"/>
                <span className="select-fighter-name">{fighter.name}</span>
                {main && <span className="select-fighter-main" aria-label="Main"><Star size={11} fill="currentColor"/></span>}
              </button>;
            })}
          </div>
          {shown.length === 0 && <div className="select-empty">Nenhum lutador encontrado. <button type="button" onClick={() => setQuery('')}>Limpar busca</button></div>}
          <div className="select-roster-bottom"><span><span className="select-bottom-dot"/> SELECT YOUR CHARACTER</span><span>{data.mains.length} FAVORITOS / {data.combos.length} COMBOS SALVOS</span></div>
        </div>

        <aside className="select-stage" style={{ '--fighter-color': selected.hue } as CSSProperties} aria-label={`Personagem selecionado: ${selected.name}`}>
          <div className="select-stage-backdrop" aria-hidden="true"/>
          <div className="select-stage-copy">
            <p className="select-eyebrow"><span className="pulse-dot"/> THE TRAINING GROUNDS <span className="select-kicker-line"/> SEASON 01</p>
            <h1>BUILD YOUR COMBOS.<br/><span>OWN THE FIGHT.</span></h1>
            <p>Seus personagens. Seus combos. Seu jeito de jogar.</p>
          </div>
          <div className="select-stage-portrait" key={selected.id}>
            <FighterArtwork fighter={selected} variant="stage"/>
          </div>
          <div className="select-stage-information" key={`${selected.id}-info`}>
            <div className="select-stage-number">{String(fighters.indexOf(selected) + 1).padStart(2, '0')} / {String(fighters.length).padStart(2, '0')} <span>SELECTED FIGHTER</span></div>
            <h2>{selected.name}</h2>
            <p>{selected.title} <span className="select-info-divider"/> {selectedCombos} {selectedCombos === 1 ? 'COMBO' : 'COMBOS'}</p>
            <div className="select-stage-actions">
              <Link className="primary-button" to={`/fighter/${selected.id}`}><Gamepad2 size={17}/> ABRIR COMBOS <ArrowRight size={16}/></Link>
              <button type="button" className={`select-main-button ${isSelectedMain ? 'select-main-button--active' : ''}`} onClick={() => toggleMain(selected.id)}>
                {isSelectedMain ? <Check size={17}/> : <Plus size={17}/>}
                {isSelectedMain ? 'NOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
              </button>
            </div>
            <Link to="/mains" className="select-my-mains"><Star size={13}/> MINHA COLEÇÃO <ArrowRight size={13}/></Link>
          </div>
          <span className="select-stage-edge" aria-hidden="true">SF6 / TRAINING MODE / NO. 001</span>
        </aside>
      </section>
    </main>;
}
