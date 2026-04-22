import { cn } from '@/lib/utils';
import type { SavedMode } from '../../../shared/modes';

type SidebarCurrentModeProps = {
  activeMode: SavedMode | null;
};

export function SidebarCurrentMode({ activeMode }: SidebarCurrentModeProps) {
  return (
    <section className="relative mx-3 flex h-9 items-center gap-2.5 rounded-[4px] border border-white/[0.055] bg-white/[0.025] px-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full shadow-[0_0_14px_currentColor]',
          activeMode === null
            ? 'bg-status-neutral/35 text-status-neutral/35'
            : 'bg-status-active text-status-active'
        )}
      />
      <p className="min-w-0 truncate font-heading font-medium tracking-normal text-foreground">
        {activeMode?.name ?? 'No Active Mode'}
      </p>
    </section>
  );
}
