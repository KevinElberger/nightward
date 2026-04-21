import { AppSelectionProvider } from './features/app-shell/app-selection-provider';
import { AppSidebar } from './features/app-shell/app-sidebar';
import { ModesProvider } from './features/modes/modes-provider';
import { OverviewPage } from './features/overview/overview-page';

export function App() {
  return (
    <ModesProvider>
      <AppSelectionProvider>
        <main className="app h-screen overflow-hidden bg-background text-foreground">
          <div className="relative grid h-screen w-full grid-cols-[296px_minmax(0,1fr)] overflow-hidden">
            <AppSidebar />
            <OverviewPage />
          </div>
        </main>
      </AppSelectionProvider>
    </ModesProvider>
  );
}
