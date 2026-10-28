import { commandMap } from '../data/commands';
import type { ComboStep, CommandDefinition } from '../types';

export function CommandIcon({ command, size = 'regular' }: { command: CommandDefinition; size?: 'regular' | 'large' }) {
  return <span className={`command-icon command-icon--${size} command-icon--${command.group}`}>
    {command.image
      ? <img src={command.image} alt="" draggable={false} className={command.mirrored ? 'mirror-icon' : ''} />
      : <span className="command-text-icon">{command.text}</span>}
  </span>;
}

export function CommandToken({ step, onClick, selected = false, title }: {
  step: ComboStep;
  onClick?: () => void;
  selected?: boolean;
  title?: string;
}) {
  const command = commandMap.get(step.key);
  if (!command) return null;
  const label = title || command.label;
  return onClick ? <button type="button" onClick={onClick} title={label} aria-label={label}
    className={`combo-token interactive-token ${selected ? 'selected-token' : ''}`}><CommandIcon command={command} /></button>
    : <span className="combo-token" title={label} role="img" aria-label={label}><CommandIcon command={command} /></span>;
}

export function ComboSequence({ steps }: { steps: ComboStep[] }) {
  if (!steps.length) return <span className="sequence-empty">Nenhum comando adicionado</span>;
  return <div className="combo-sequence" aria-label={steps.map((step) => commandMap.get(step.key)?.label).join(', ')}>
    {steps.map((step) => <CommandToken key={step.id} step={step} />)}
  </div>;
}
