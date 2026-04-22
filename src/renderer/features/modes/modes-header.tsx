import { useAppSelection } from '../app-shell/use-app-selection';
import { useModes } from './use-modes-context';

export function ModesHeader() {
  const { selectedModeId } = useAppSelection();
  const { modes } = useModes();
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) ?? null;

  return (
    <header className="app-drag absolute inset-x-0 top-0 z-10 flex h-12 items-center border-b border-white/[0.09] bg-background/82 px-5 shadow-[0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl">
      <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-normal">
        <span className={selectedMode === null ? 'text-white/90' : 'text-white/46'}>Modes</span>
        {selectedMode === null ? null : (
          <>
            <span className="text-white/24" aria-hidden="true">
              /
            </span>
            <span className="truncate text-white/90">{selectedMode.name}</span>
          </>
        )}
      </nav>
    </header>
  );
}
