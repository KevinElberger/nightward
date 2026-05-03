import { Radio } from 'lucide-react';

export function ModeDetailSummaryRail() {
  return (
    <aside className="relative border-l border-white/[0.07] bg-white/[0.034] shadow-[inset_1px_0_0_rgba(255,255,255,0.026)] lg:min-h-full">
      <section className="relative px-4 pb-7 pt-14">
        <header className="mb-5 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <h3 className="truncate text-lg font-semibold tracking-normal text-foreground">
                Trigger
              </h3>
              <Radio className="size-3.5 shrink-0 text-white/42" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs font-medium leading-5 text-white/38">
              How this mode starts.
            </p>
          </div>
          <span className="mt-0.5 shrink-0 rounded-[5px] bg-white/[0.065] px-2 py-1 text-xs font-medium text-white/48">
            Manual
          </span>
        </header>

        <div className="rounded-[8px] bg-white/[0.052] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.032)]">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Manual activation</p>
            <p className="mt-1.5 text-xs leading-5 text-white/42">
              Starts from the app window or the system tray.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-[5px] bg-white/[0.06] px-2 py-1 text-xs font-medium text-white/52">
              Window
            </span>
            <span className="rounded-[5px] bg-white/[0.06] px-2 py-1 text-xs font-medium text-white/52">
              Tray
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}
