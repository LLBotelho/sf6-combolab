import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Combo } from '../types';
import { ComboCard } from './ComboCard';
import { ComboDetailDialog } from './ComboDetailDialog';

type IndexedCombo = { combo: Combo; index: number };

interface Props {
  combos: Combo[];
  resetKey: string;
  hasAnyCombos: boolean;
  onEdit: (combo: Combo) => void;
  onCreate: () => void;
}

/** Split cards by their *rendered height*, not a fixed count. This keeps the
 * desktop playbook inside the viewport even with variable length sequences. */
export function PaginatedComboList({ combos, resetKey, hasAnyCombos, onEdit, onCreate }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<IndexedCombo[][]>([]);
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Combo | null>(null);
  useLayoutEffect(() => { setPage(0); }, [resetKey]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measuring = measureRef.current;
    if (!viewport || !measuring) return;

    const repaginate = () => {
      const available = viewport.getBoundingClientRect().height;
      if (available <= 0) return;
      const cards = Array.from(measuring.children) as HTMLElement[];
      if (cards.length !== combos.length) return;
      const gap = 9;
      const next: IndexedCombo[][] = [];
      let group: IndexedCombo[] = [];
      let used = 0;
      cards.forEach((card, index) => {
        // A long card has a compact preview and an explicit full-detail dialog.
        const height = card.getBoundingClientRect().height;
        if (group.length && used + gap + height > available) {
          next.push(group);
          group = [];
          used = 0;
        }
        group.push({ combo: combos[index], index });
        used += (used ? gap : 0) + height;
      });
      if (group.length) next.push(group);
      setPages((old) => {
        if (old.length === next.length && old.every((items, i) =>
          items.length === next[i].length && items.every((item, j) => item.combo === next[i][j].combo && item.index === next[i][j].index))) return old;
        return next;
      });
    };

    repaginate();
    const resize = new ResizeObserver(repaginate);
    resize.observe(viewport);
    resize.observe(measuring);
    Array.from(measuring.children).forEach((child) => resize.observe(child));
    return () => resize.disconnect();
  }, [combos]);

  const activePage = Math.min(page, Math.max(0, pages.length - 1));
  const visible = pages[activePage] ?? [];

  return <section className="playbook-results" aria-label="Lista paginada de combos">
    {combos.length ? <>
      <div className="combo-page-window" ref={viewportRef}>
        <div className="combo-list combo-list--paged">
          {visible.map(({ combo, index }) => <ComboCard key={combo.id} combo={combo} index={index} onEdit={onEdit} onView={setDetail} compact />)}
        </div>
        <div className="combo-list combo-measure" ref={measureRef} aria-hidden="true" inert>
          {combos.map((combo, index) => <ComboCard key={combo.id} combo={combo} index={index} onEdit={onEdit} compact />)}
        </div>
      </div>
      <nav className="combo-pagination" aria-label="Páginas dos combos">
        <span className="page-caption">{visible.length ? `${visible[0].index + 1}–${visible[visible.length - 1].index + 1}` : '0'} DE {combos.length}</span>
        <div className="page-navigation">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={activePage === 0} aria-label="Página anterior"><ChevronLeft size={16}/></button>
          <span aria-live="polite">{activePage + 1} <span className="page-slash">/</span> {Math.max(1, pages.length)}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(Math.max(0, pages.length - 1), p + 1))} disabled={activePage >= pages.length - 1} aria-label="Próxima página"><ChevronRight size={16}/></button>
        </div>
        <span className="page-caption page-caption--right">NAVEGUE SEM ROLAR</span>
      </nav>
    </> : <div className="empty-combos empty-combos--playbook"><div className="empty-combos-icon">✦</div><h3>{hasAnyCombos ? 'NENHUM COMBO NESTE FILTRO' : 'SEU PRIMEIRO COMBO COMEÇA AQUI'}</h3><p>{hasAnyCombos ? 'Experimente outra categoria, etiqueta ou busca.' : 'Abra o editor, selecione direções e ataques e salve sua primeira sequência.'}</p><button className="primary-button" type="button" onClick={onCreate}><Plus size={18}/> CRIAR COMBO</button></div>}
    {detail && <ComboDetailDialog combo={detail} onClose={() => setDetail(null)}/>}
  </section>;
}
