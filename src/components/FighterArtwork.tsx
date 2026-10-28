import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Fighter } from '../types';
import { getFighterArtwork, portraitFraming } from '../data/fighterArtwork';

interface Props {
  fighter: Fighter;
  variant: 'portrait' | 'stage';
}

/** Its key includes the URL so a failed image never hides the next selected fighter. */
function FighterArtImage({ url, fighter, variant }: { url: string; fighter: Fighter; variant: Props['variant'] }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="fighter-artwork-fallback" aria-hidden="true">{fighter.abbreviation}</span>;
  return <img src={url} alt={variant === 'stage' ? `Arte de ${fighter.name}` : ''}
    loading={variant === 'portrait' ? 'lazy' : 'eager'}
    decoding="async" onError={() => setFailed(true)} />;
}

export function FighterArtwork({ fighter, variant }: Props) {
  const url = getFighterArtwork(fighter, variant);
  const framing = portraitFraming[fighter.id];
  const style = variant === 'portrait' && framing ? {
    '--face-x': `${framing.x}%`, '--face-y': `${framing.y}%`, '--face-zoom': framing.zoom,
  } as CSSProperties : undefined;

  return <div className={`fighter-artwork fighter-artwork--${variant}`} style={style}>
    {url ? (
      <FighterArtImage key={`${fighter.id}:${variant}:${url}`} url={url} fighter={fighter} variant={variant}/>
    ) : (
      <span className="fighter-artwork-fallback" aria-hidden="true">{fighter.abbreviation}</span>
    )}
  </div>;
}
