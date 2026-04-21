import { useState } from 'react';
import { useAppSelection } from '../app-shell/use-app-selection';
import { useModes } from '../modes/use-modes-context';
import { ModeLibrary } from './mode-library';

export function OverviewPage() {
  const { activateMode, activeModeId, createMode, error, isLoading, modes } = useModes();
  const { selectMode, selectedModeId } = useAppSelection();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    <section className="relative h-screen min-w-0 overflow-hidden border-l border-white/[0.055] bg-background">
      <header className="app-drag absolute inset-x-0 top-0 z-10 flex h-12 items-center border-b border-white/[0.09] bg-background/82 px-5 shadow-[0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl">
        <h1 className="text-sm font-semibold tracking-normal text-white/90">Modes</h1>
      </header>

      <div className="h-full overflow-y-auto px-8 pb-8 pt-20">
        <div className="flex w-full flex-col gap-8">
          <ModeLibrary
            activeModeId={activeModeId}
            error={error}
            isLoading={isLoading}
            modes={modes}
            onActivateMode={activateMode}
            onCreateMode={() => {
              void handleCreateMode();
            }}
            onSelectMode={selectMode}
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            selectedModeId={selectedModeId}
            isCreating={isCreating}
          />
        </div>
      </div>
    </section>
  );
}
