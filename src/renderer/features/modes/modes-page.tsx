import { ModeLibrary } from './components/mode-library';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeDetailPage } from './mode-detail-page';
import { ModesHeader } from './modes-header';

export function ModesPage() {
  const { selectedModeId } = useAppSelection();

  return (
    <section className="relative h-screen min-w-0 overflow-hidden border-l border-white/[0.055] bg-background">
      <ModesHeader />

      <div className="h-full overflow-y-auto px-8 pb-8 pt-20">
        <div className="flex w-full flex-col gap-8">
          {selectedModeId === null ? <ModeLibrary /> : <ModeDetailPage />}
        </div>
      </div>
    </section>
  );
}
