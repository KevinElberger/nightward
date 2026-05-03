import { cn } from '@/lib/utils';
import type { SavedMode } from '../../../shared/modes';

type SidebarCurrentModeProps = {
  activeMode: SavedMode | null;
};

export function SidebarCurrentMode({ activeMode }: SidebarCurrentModeProps) {
  return (
    <section className="relative mx-3.5 flex h-10 items-center gap-2.5 rounded-[7px] border border-white/[0.075] bg-white/[0.04] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_10px_26px_rgba(0,0,0,0.18)]">
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full shadow-[0_0_14px_currentColor]',
          activeMode === null
            ? 'bg-status-neutral/35 text-status-neutral/35'
            : 'bg-status-active text-status-active'
        )}
      />
      <p className="min-w-0 truncate font-heading font-medium tracking-normal text-white/88">
        {activeMode?.name ?? 'No Active Mode'}
      </p>
    </section>
  );
}
