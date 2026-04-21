import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SavedMode } from '../../../shared/modes';
import { SidebarMessage } from './sidebar-message';
import { SidebarNavItem } from './sidebar-nav-item';
import { SidebarSkeleton } from './sidebar-skeleton';

type SidebarModeListProps = {
  activeModeId: string | null;
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  onSelectMode: (modeId: string) => void;
  selectedModeId: string | null;
};

export function SidebarModeList({
  activeModeId,
  error,
  isLoading,
  modes,
  onSelectMode,
  selectedModeId
}: SidebarModeListProps) {
  return (
    <>
      <div className="relative mt-3 flex items-center justify-between px-4 py-2">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-white/36">
          Modes
        </p>
        <Badge
          variant="secondary"
          className="h-5 rounded-[3px] border border-white/[0.05] bg-white/[0.035] px-1.5 font-mono text-[0.61rem] text-white/45"
        >
          {modes.length}
        </Badge>
      </div>

      <ScrollArea className="relative min-h-0 flex-1 px-3 pb-3">
        {isLoading ? (
          <SidebarSkeleton />
        ) : error !== null ? (
          <SidebarMessage title="Could not load modes" description={error} />
        ) : modes.length === 0 ? (
          <SidebarMessage title="No modes yet" description="Create your first mode to begin." />
        ) : (
          <nav className="space-y-px">
            {modes.map((mode) => (
              <SidebarNavItem
                key={mode.id}
                isActive={mode.id === activeModeId}
                isSelected={mode.id === selectedModeId}
                label={mode.name}
                onClick={() => {
                  onSelectMode(mode.id);
                }}
              />
            ))}
          </nav>
        )}
      </ScrollArea>
    </>
  );
}
