import { Toaster } from '@/components/ui/sonner';
import { AppSelectionProvider } from './features/app-shell/app-selection-provider';
import { AppSidebar } from './features/app-shell/app-sidebar';
import { ModesPage } from './features/modes/modes-page';
import { ModesProvider } from './features/modes/modes-provider';

export function App() {
  return (
    <ModesProvider>
      <AppSelectionProvider>
        <main className="app h-screen overflow-hidden bg-background text-foreground">
          <div className="relative grid h-screen w-full grid-cols-[304px_minmax(0,1fr)] overflow-hidden">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.12]"
              aria-hidden="true"
            />
            <AppSidebar />
            <ModesPage />
          </div>
          <Toaster position="bottom-right" richColors />
        </main>
      </AppSelectionProvider>
    </ModesProvider>
  );
}
