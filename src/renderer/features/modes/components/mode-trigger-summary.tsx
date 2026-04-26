import { Play } from 'lucide-react';

export function ModeTriggerSummary() {
  return (
    <section className="overflow-hidden rounded-[6px] border border-surface-border bg-surface-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between gap-3 border-b border-surface-border-subtle bg-surface-panel-muted px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-surface-border-subtle bg-surface-control text-primary">
            <Play className="size-4" aria-hidden="true" />
          </span>
          <h3 className="truncate text-sm font-semibold tracking-normal text-foreground">
            Trigger
          </h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-white/34">Manual</span>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-[5px] border border-surface-border-subtle bg-surface-card px-3 py-3">
          <div className="text-sm font-medium text-foreground">Manual activation</div>
          <div className="mt-1 text-xs leading-5 text-white/42">Window · Tray</div>
        </div>
      </div>
    </section>
  );
}
