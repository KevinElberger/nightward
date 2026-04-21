import { useState } from 'react';
import { AppSidebar } from './features/app-shell/app-sidebar';
import { useModes } from './features/modes/hooks/use-modes';

export function App() {
  const { activeModeId, error, isLoading, modes } = useModes();
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);

  return (
    <main className="app h-screen overflow-hidden bg-background text-foreground">
      <div className="relative grid h-screen w-full grid-cols-[296px_minmax(0,1fr)] overflow-hidden">
        <AppSidebar
          activeModeId={activeModeId}
          error={error}
          isLoading={isLoading}
          modes={modes}
          onSelectMode={setSelectedModeId}
          selectedModeId={selectedModeId}
        />

        <section className="app-drag flex h-screen min-w-0 items-center justify-center overflow-hidden border-l border-white/5 bg-background">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Main surface paused
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-normal">
              Sidebar workbench
            </h2>
          </div>
        </section>
      </div>
    </main>
  );
}
