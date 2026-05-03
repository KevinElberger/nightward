import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelection } from '../app-shell/use-app-selection';
import { useModes } from './use-modes-context';

export function ModesHeader() {
  const { selectMode, selectedModeId } = useAppSelection();
  const { modes } = useModes();
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) ?? null;
  const isAtModesRoot = selectedMode === null;

  return (
    <header className="app-drag absolute inset-x-0 top-0 z-10 flex h-[52px] items-center gap-3 border-b border-white/[0.085] bg-background/88 px-6 shadow-[0_1px_0_rgba(255,255,255,0.035),0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <button
        type="button"
        className={cn(
          'app-no-drag relative inline-flex h-7 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[background-color,border-color,color,opacity,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35',
          isAtModesRoot
            ? 'cursor-default border-white/[0.04] bg-white/[0.012] text-white/24 shadow-none'
            : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.065),0_8px_22px_rgba(0,0,0,0.2)]'
        )}
        aria-label="Go to modes home"
        title="Modes home"
        disabled={isAtModesRoot}
        onClick={() => {
          selectMode(null);
        }}
      >
        <Home className="relative size-3.5" aria-hidden="true" />
      </button>

      <span className="h-5 w-px shrink-0 bg-surface-border-subtle" aria-hidden="true" />

      <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-normal">
        <span className={selectedMode === null ? 'text-white/90' : 'text-white/44'}>Modes</span>
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
