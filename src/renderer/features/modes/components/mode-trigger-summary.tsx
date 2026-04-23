import { Play } from 'lucide-react';

export function ModeTriggerSummary() {
  return (
    <section className="overflow-hidden rounded-[6px] border border-white/[0.075] bg-white/[0.042] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.016] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.065] bg-white/[0.04] text-primary">
            <Play className="size-4" aria-hidden="true" />
          </span>
          <h3 className="truncate text-sm font-semibold tracking-normal text-foreground">
            Trigger
          </h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-white/34">Manual</span>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-[5px] border border-white/[0.055] bg-white/[0.026] px-3 py-3">
          <div className="text-sm font-medium text-foreground">Manual activation</div>
          <div className="mt-1 text-xs leading-5 text-white/42">Window · Tray</div>
        </div>
      </div>
    </section>
  );
}
