import { Check, Circle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SavedMode } from '../../../shared/modes';
import { cn } from '@/lib/utils';
import { ModeLibraryEmptyState } from './mode-library-empty-state';

type ModeLibraryProps = {
  activeModeId: string | null;
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  onActivateMode: (id: string) => Promise<boolean>;
  onSelectMode: (modeId: string | null) => void;
  searchQuery: string;
  selectedModeId: string | null;
};

export function ModeLibrary({
  activeModeId,
  error,
  isLoading,
  modes,
  onActivateMode,
  onSelectMode,
  searchQuery,
  selectedModeId
}: ModeLibraryProps) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredModes =
    normalizedSearchQuery.length === 0
      ? modes
      : modes.filter((mode) => mode.name.toLowerCase().includes(normalizedSearchQuery));

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-normal text-foreground">
            Modes
          </h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-[6px] border border-white/[0.065] bg-white/[0.018] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {isLoading ? (
          <ModeLibrarySkeleton />
        ) : error !== null ? (
          <ModeLibraryMessage title="Unable to load modes" description={error} />
        ) : modes.length === 0 ? (
          <ModeLibraryEmptyState />
        ) : filteredModes.length === 0 ? (
          <ModeLibraryMessage
            title="No modes found"
            description="Create a new mode or try another search."
          />
        ) : (
          <div className="divide-y divide-white/[0.055]">
            {filteredModes.map((mode) => {
              const isActive = mode.id === activeModeId;
              const isSelected = mode.id === selectedModeId;

              return (
                <div
                  key={mode.id}
                  className={cn(
                    'group grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 transition-colors',
                    isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.025]'
                  )}
                >
                  <button
                    type="button"
                    className="app-no-drag flex min-w-0 items-center gap-3 text-left"
                    onClick={() => {
                      onSelectMode(mode.id);
                    }}
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.055] bg-white/[0.025]',
                        isActive ? 'text-primary' : 'text-white/32'
                      )}
                    >
                      {isActive ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="size-3" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {mode.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/34">
                        {isActive ? 'Active' : 'Ready'}
                      </span>
                    </span>
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isActive}
                    className="app-no-drag h-8 rounded-[4px] px-2.5 text-white/48 hover:bg-white/[0.05] hover:text-foreground disabled:opacity-35"
                    onClick={() => {
                      void onActivateMode(mode.id);
                    }}
                  >
                    <Play className="size-3" aria-hidden="true" />
                    {isActive ? 'Active' : 'Activate'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function ModeLibrarySkeleton() {
  return (
    <div className="divide-y divide-white/[0.055]">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex h-14 items-center gap-3 px-4">
          <div className="size-7 rounded-[4px] bg-white/[0.035]" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-[3px] bg-white/[0.045]" />
            <div className="h-2.5 w-16 rounded-[3px] bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModeLibraryMessage({ description, title }: { description: string; title: string }) {
  return (
    <div className="px-4 py-5">
      <p className="text-sm font-medium text-white/78">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/42">{description}</p>
    </div>
  );
}
