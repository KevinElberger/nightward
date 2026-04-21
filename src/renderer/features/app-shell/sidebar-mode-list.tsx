import { Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

const PINNED_MODE_LIMIT = 5;

export function SidebarModeList({
  activeModeId,
  error,
  isLoading,
  modes,
  onSelectMode,
  selectedModeId
}: SidebarModeListProps) {
  const pinnedModes = modes.slice(0, PINNED_MODE_LIMIT);

  return (
    <>
      <div className="relative mt-3 flex items-center justify-between px-1 py-2">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-white/36">
          Pinned
        </p>
        <Badge
          variant="secondary"
          className="h-5 rounded-[3px] border border-white/[0.05] bg-white/[0.035] px-1.5 font-mono text-[0.61rem] text-white/45"
        >
          {pinnedModes.length}
        </Badge>
      </div>

      {isLoading ? (
        <SidebarSkeleton />
      ) : error !== null ? (
        <SidebarMessage title="Could not load modes" description={error} />
      ) : modes.length === 0 ? (
        <SidebarMessage
          title="No pinned modes"
          description="Create a mode to pin it here."
          icon={<Pin className="size-3 text-white/48" aria-hidden="true" />}
        />
      ) : (
        <nav className="space-y-px">
          {pinnedModes.map((mode) => (
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
    </>
  );
}
