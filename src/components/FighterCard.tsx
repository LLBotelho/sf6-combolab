import { Check, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import type { Fighter } from '../types';

export function FighterCard({ fighter, index = 0 }: { fighter: Fighter; index?: number }) {
  const { data, isMain, toggleMain } = useCollection();
  const main = isMain(fighter.id);
  const count = data.combos.filter((combo) => combo.characterId === fighter.id).length;
  return <article className={`fighter-card ${main ? 'fighter-card--main' : ''}`} style={{ '--fighter-color': fighter.hue } as React.CSSProperties}>
    <div className="fighter-card-top"><span>{String(index + 1).padStart(2,'0')} / FIGHTER</span><span>{main ? 'MAIN SELECTED' : 'AVAILABLE'}</span></div>
    <Link to={`/fighter/${fighter.id}`} className="fighter-art-zone" aria-label={`Ver combos de ${fighter.name}`}>
      {fighter.isReferenceArt ? <img src="/assets/honda-reference.png" alt="Arte de E. Honda da referência enviada" className="fighter-art-honda" /> :
        <span className="fighter-placeholder" aria-hidden="true">{fighter.abbreviation}</span>}
      <span className="fighter-card-open"><ArrowUpRight size={18}/></span>
    </Link>
    <div className="fighter-card-bottom">
      <div><p className="fighter-card-title">{fighter.name}</p><p className="fighter-card-subtitle">{count} {count === 1 ? 'COMBO SALVO' : 'COMBOS SALVOS'}</p></div>
      <button type="button" onClick={() => toggleMain(fighter.id)} aria-label={main ? `Remover ${fighter.name} dos favoritos` : `Adicionar ${fighter.name} aos favoritos`}
        title={main ? 'Remover dos favoritos (combos preservados)' : 'Adicionar aos favoritos'} className={`fighter-add ${main ? 'fighter-add--active' : ''}`}>
        {main ? <Check size={20}/> : <Plus size={20}/>}</button>
    </div>
  </article>;
}
