import { ModeLibrary } from './components/mode-library';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeDetailPage } from './mode-detail-page';

export function ModesPage() {
  const { selectedModeId } = useAppSelection();

  return (
    <section className="relative h-screen min-w-0 overflow-hidden border-l border-white/[0.055] bg-background">
      <header className="app-drag absolute inset-x-0 top-0 z-10 flex h-12 items-center border-b border-white/[0.09] bg-background/82 px-5 shadow-[0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl">
        <h1 className="text-sm font-semibold tracking-normal text-white/90">Modes</h1>
      </header>

      <div className="h-full overflow-y-auto px-8 pb-8 pt-20">
        <div className="flex w-full flex-col gap-8">
          {selectedModeId === null ? <ModeLibrary /> : <ModeDetailPage />}
        </div>
      </div>
    </section>
  );
}
