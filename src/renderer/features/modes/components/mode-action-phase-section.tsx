import { Plus, Workflow } from 'lucide-react';
import type { ModeAction } from '@shared/modes';
import { Button } from '@/components/ui/button';
import { ModeActionCard } from './mode-action-card';

type ModeActionPhaseSectionProps = {
  actions: ModeAction[];
  addLabel: string;
  emptyTitle: string;
  title: string;
};

export function ModeActionPhaseSection({
  actions,
  addLabel,
  emptyTitle,
  title
}: ModeActionPhaseSectionProps) {
  const actionCountLabel = `${actions.length} ${actions.length === 1 ? 'action' : 'actions'}`;

  return (
    <section className="overflow-hidden rounded-[6px] border border-white/[0.075] bg-white/[0.042] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.016] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.065] bg-white/[0.04] text-primary">
            <Workflow className="size-4" aria-hidden="true" />
          </span>
          <h3 className="truncate text-sm font-semibold tracking-normal text-foreground">
            {title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-white/34">{actionCountLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 rounded-[4px] px-2 text-white/48 hover:bg-white/[0.04] hover:text-foreground disabled:opacity-35"
            disabled
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {addLabel}
          </Button>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center px-4 py-6 text-sm font-medium text-white/38">
          {emptyTitle}
        </div>
      ) : (
        <div className="space-y-2 p-3">
          {actions.map((action) => (
            <ModeActionCard key={action.id} action={action} />
          ))}
        </div>
      )}
    </section>
  );
}
