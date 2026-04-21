import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <section className="flex h-screen min-w-0 flex-col overflow-hidden border-l border-white/[0.055] bg-background">
      <header className="app-drag flex h-12 shrink-0 items-center justify-end border-b border-white/[0.055] px-5">
        <div className="app-no-drag flex w-[360px] items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/34"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              aria-label="Search modes"
              placeholder="Search modes"
              className="h-8 rounded-[4px] border-white/[0.075] bg-white/[0.025] pl-8 text-sm text-foreground placeholder:text-white/28 focus-visible:ring-primary/20"
            />
          </div>
          <Button
            type="button"
            size="xs"
            disabled={isCreating}
            className="h-8 rounded-[4px] bg-primary px-2.5 text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              void handleCreateMode();
            }}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Create
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="flex w-full flex-col gap-8">
          <ModeLibrary
            activeModeId={activeModeId}
            error={error}
            isLoading={isLoading}
            modes={modes}
            onActivateMode={activateMode}
            onSelectMode={selectMode}
            searchQuery={searchQuery}
            selectedModeId={selectedModeId}
          />
        </div>
      </div>
    </section>
  );
}
