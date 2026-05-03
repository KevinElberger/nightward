import { useState } from 'react';
import { useAppSelection } from '../../app-shell/use-app-selection';
import { useModes } from '../use-modes-context';
import { ModeLibraryEmptyState } from './mode-library-empty-state';
import { ModeLibraryMessage } from './mode-library-message';
import { ModeLibraryRow } from './mode-library-row';
import { ModeLibrarySearchEmptyState } from './mode-library-search-empty-state';
import { ModeLibrarySkeleton } from './mode-library-skeleton';
import { ModeLibraryToolbar } from './mode-library-toolbar';

export function ModeLibrary() {
  const {
    activateMode,
    activeModeId,
    createMode,
    deactivateMode,
    deleteMode,
    error,
    isLoading,
    modes,
    renameMode,
    setModePinned
  } = useModes();
  const { selectMode, selectedModeId } = useAppSelection();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredModes =
    normalizedSearchQuery.length === 0
      ? modes
      : modes.filter((mode) => mode.name.toLowerCase().includes(normalizedSearchQuery));

  const handleCreateMode = async () => {
    if (isCreating) {
      return;
    }

    const baseName = 'New Mode';
    const existingNames = new Set(modes.map((mode) => mode.name.toLowerCase()));
    let nextName = baseName;
    let suffix = 2;

    while (existingNames.has(nextName.toLowerCase())) {
      nextName = `${baseName} ${suffix}`;
      suffix += 1;
    }

    setIsCreating(true);

    try {
      const createdMode = await createMode(nextName);

      if (createdMode !== null) {
        selectMode(createdMode.id);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section>
      {modes.length > 0 ? (
        <ModeLibraryToolbar
          isCreating={isCreating}
          modeCount={modes.length}
          onCreateMode={() => {
            void handleCreateMode();
          }}
          onSearchQueryChange={setSearchQuery}
          searchQuery={searchQuery}
        />
      ) : (
        <div className="mb-5">
          <h2 className="font-heading text-[1.7rem] font-semibold leading-tight text-foreground">
            Modes
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/46">0 modes</p>
        </div>
      )}

      <div className="overflow-hidden rounded-[8px] border border-surface-border bg-surface-panel shadow-[0_18px_54px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.045)]">
        {isLoading ? (
          <ModeLibrarySkeleton />
        ) : error !== null ? (
          <ModeLibraryMessage title="Unable to load modes" description={error} />
        ) : modes.length === 0 ? (
          <ModeLibraryEmptyState
            isCreating={isCreating}
            onCreateMode={() => {
              void handleCreateMode();
            }}
          />
        ) : filteredModes.length === 0 ? (
          <ModeLibrarySearchEmptyState
            query={searchQuery.trim()}
            onClearSearch={() => {
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="divide-y divide-surface-border-subtle">
            {filteredModes.map((mode) => {
              const isActive = mode.id === activeModeId;
              const isSelected = mode.id === selectedModeId;

              return (
                <ModeLibraryRow
                  key={mode.id}
                  isActive={isActive}
                  isSelected={isSelected}
                  mode={mode}
                  onActivateMode={activateMode}
                  onDeactivateMode={deactivateMode}
                  onDeleteMode={deleteMode}
                  onRenameMode={renameMode}
                  onSelectMode={selectMode}
                  onSetPinned={setModePinned}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
