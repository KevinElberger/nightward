import { ChevronRight, Moon, Settings2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useModes } from './hooks/use-modes';

export function App() {
  const { activeModeId, error, isLoading, modes, refreshModes } = useModes();
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);

  const effectiveSelectedModeId =
    selectedModeId !== null && modes.some((mode) => mode.id === selectedModeId)
      ? selectedModeId
      : (activeModeId ?? modes[0]?.id ?? null);

  const selectedMode = useMemo(
    () => modes.find((mode) => mode.id === effectiveSelectedModeId) ?? null,
    [modes, effectiveSelectedModeId]
  );

  return (
    <main className="app min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
                <Moon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-[1.05rem] font-semibold leading-none tracking-normal">
                  Nightward
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">Mode settings</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Modes
            </p>
            <Badge variant="secondary" className="rounded-md font-mono text-[0.65rem]">
              {modes.length}
            </Badge>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
            {isLoading ? (
              <ModeListSkeleton />
            ) : error !== null ? (
              <SidebarMessage title="Could not load modes" description={error} />
            ) : modes.length === 0 ? (
              <SidebarMessage
                title="No modes yet"
                description="Create your first mode in the next setup step."
              />
            ) : (
              <nav className="space-y-1">
                {modes.map((mode) => {
                  const isSelected = mode.id === effectiveSelectedModeId;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={cn(
                        'group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => {
                        setSelectedModeId(mode.id);
                      }}
                    >
                      <span className="min-w-0 truncate font-medium">{mode.name}</span>
                      <ChevronRight
                        className={cn(
                          'size-4 shrink-0 transition-opacity',
                          isSelected ? 'opacity-80' : 'opacity-0 group-hover:opacity-50'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </nav>
            )}
          </ScrollArea>

          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg border border-sidebar-border bg-background/30 p-3">
              <p className="text-xs font-medium text-sidebar-foreground">Local workspace</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Account sync will fit here when the cloud layer exists.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-background">
          <header className="flex h-16 items-center justify-between border-b px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Settings
              </p>
              <h2 className="font-heading text-lg font-semibold tracking-normal">
                {selectedMode?.name ?? 'Modes'}
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refreshModes()}>
              Refresh
            </Button>
          </header>

          <div className="p-8">
            {isLoading ? (
              <MainPanelShell>
                <div className="space-y-3">
                  <div className="h-5 w-40 rounded-md bg-muted" />
                  <div className="h-4 w-72 rounded-md bg-muted/70" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-lg border bg-card" />
                  <div className="h-24 rounded-lg border bg-card" />
                </div>
              </MainPanelShell>
            ) : error !== null ? (
              <MainPanelShell>
                <EmptyState
                  icon={<Settings2 className="size-5" aria-hidden="true" />}
                  title="Unable to load mode settings"
                  description={error}
                />
              </MainPanelShell>
            ) : selectedMode === null ? (
              <MainPanelShell>
                <EmptyState
                  icon={<Sparkles className="size-5" aria-hidden="true" />}
                  title="No modes configured"
                  description="The next step will add creation controls here. This shell is connected to the mode bridge and ready for mode management."
                />
              </MainPanelShell>
            ) : (
              <MainPanelShell>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Badge variant="secondary" className="rounded-md">
                      {selectedMode.id === activeModeId ? 'Active mode' : 'Saved mode'}
                    </Badge>
                    <h3 className="mt-4 font-heading text-3xl font-semibold tracking-normal">
                      {selectedMode.name}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Mode configuration will appear here next. For now this confirms the settings
                      window can read persisted modes through the preload bridge.
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyMetric label="Mode ID" value={selectedMode.id} />
                  <ReadOnlyMetric label="Persistence" value="Local disk" />
                </div>
              </MainPanelShell>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ModeListSkeleton() {
  return (
    <div className="space-y-2 px-1">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-10 rounded-lg bg-sidebar-accent/50" />
      ))}
    </div>
  );
}

function SidebarMessage({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-background/30 p-3">
      <p className="text-sm font-medium text-sidebar-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function MainPanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[420px] rounded-xl border bg-card p-7 text-card-foreground shadow-sm">
      {children}
    </div>
  );
}

function EmptyState({
  description,
  icon,
  title
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <div className="flex size-11 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-5 font-heading text-xl font-semibold tracking-normal">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function ReadOnlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}
