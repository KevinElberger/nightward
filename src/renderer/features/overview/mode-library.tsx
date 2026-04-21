import { Check, Circle, Play, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SavedMode } from '../../../shared/modes';
import { cn } from '@/lib/utils';
import { ModeLibraryEmptyState } from './mode-library-empty-state';

type ModeLibraryProps = {
  activeModeId: string | null;
  error: string | null;
  isCreating: boolean;
  isLoading: boolean;
  modes: SavedMode[];
  onActivateMode: (id: string) => Promise<boolean>;
  onCreateMode: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectMode: (modeId: string | null) => void;
  searchQuery: string;
  selectedModeId: string | null;
};

export function ModeLibrary({
  activeModeId,
  error,
  isCreating,
  isLoading,
  modes,
  onActivateMode,
  onCreateMode,
  onSearchQueryChange,
  onSelectMode,
  searchQuery,
  selectedModeId
}: ModeLibraryProps) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredModes =
    normalizedSearchQuery.length === 0
      ? modes
      : modes.filter((mode) => mode.name.toLowerCase().includes(normalizedSearchQuery));
  const modeCountLabel = `${modes.length} ${modes.length === 1 ? 'mode' : 'modes'}`;

  return (
    <section>
      {modes.length > 0 ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/34"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value);
              }}
              aria-label="Search modes"
              placeholder="Search modes"
              className="h-8 rounded-[4px] border-white/[0.075] bg-white/[0.025] pl-8 text-sm text-foreground placeholder:text-white/28 focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-medium text-white/38">{modeCountLabel}</span>
            <Button
              type="button"
              size="xs"
              disabled={isCreating}
              className="h-8 rounded-[4px] bg-primary px-2.5 text-primary-foreground hover:bg-primary/90"
              onClick={onCreateMode}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Create
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[6px] border border-white/[0.065] bg-white/[0.018] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {isLoading ? (
          <ModeLibrarySkeleton />
        ) : error !== null ? (
          <ModeLibraryMessage title="Unable to load modes" description={error} />
        ) : modes.length === 0 ? (
          <ModeLibraryEmptyState isCreating={isCreating} onCreateMode={onCreateMode} />
        ) : filteredModes.length === 0 ? (
          <ModeLibrarySearchEmptyState
            query={searchQuery.trim()}
            onClearSearch={() => {
              onSearchQueryChange('');
            }}
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

function ModeLibrarySearchEmptyState({
  onClearSearch,
  query
}: {
  onClearSearch: () => void;
  query: string;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center px-6 py-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex size-10 items-center justify-center rounded-[4px] border border-white/[0.07] bg-white/[0.055] text-white/50">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">
          No matching modes
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/42">
          Nothing matches <span className="break-words text-white/70">"{query}"</span>. Clear the
          search or try a different name.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="mt-5 h-8 rounded-[4px] border border-white/[0.07] bg-white/[0.035] px-2.5 text-white/74 hover:bg-white/[0.06] hover:text-foreground"
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      </div>
    </div>
  );
}
