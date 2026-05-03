import { ModeLibrary } from './components/mode-library';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeDetailPage } from './mode-detail-page';
import { ModesHeader } from './modes-header';

export function ModesPage() {
  const { selectedModeId } = useAppSelection();
  const isModeDetailSelected = selectedModeId !== null;

  return (
    <section className="relative h-screen min-w-0 overflow-hidden bg-background">
      <ModesHeader />

      <div
        className={`relative h-full overflow-y-auto ${
          isModeDetailSelected ? 'pb-0 pl-0 pr-0 pt-[52px]' : 'px-7 pb-8 pt-[5.25rem]'
        }`}
      >
        <div
          className={`mx-auto flex w-full flex-col gap-6 ${
            isModeDetailSelected ? 'max-w-none' : 'max-w-6xl'
          }`}
        >
          {isModeDetailSelected ? <ModeDetailPage /> : <ModeLibrary />}
        </div>
      </div>
    </section>
  );
}
