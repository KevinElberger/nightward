import { Play, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeActionComposer } from './components/mode-action-composer';
import { ModeActionDialogProvider } from './components/mode-action-dialog-provider';
import { ModeActionPhaseSection } from './components/mode-action-phase-section';
import { ModeDetailTitle } from './components/mode-detail-title';
import { ModeDetailSummaryRail } from './components/mode-trigger-summary';
import { ModeRowOverflowMenu } from './components/mode-row-overflow-menu';
import { useModes } from './use-modes-context';

export function ModeDetailPage() {
  const { selectMode, selectedModeId } = useAppSelection();
  const {
    activateMode,
    activeModeId,
    deactivateMode,
    deleteMode,
    modes,
    renameMode,
    setModePinned
  } = useModes();
  const mode = modes.find((savedMode) => savedMode.id === selectedModeId) ?? null;

  if (mode === null) {
    return null;
  }

  const isActive = mode.id === activeModeId;

  return (
    <ModeActionDialogProvider mode={mode}>
      <section>
        <div className="grid min-h-[calc(100vh-52px)] gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 px-8 pb-8 pt-14 lg:pl-10 lg:pr-8 xl:pl-12 xl:pr-8">
            <div className="w-full space-y-8">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                <ModeDetailTitle modeId={mode.id} name={mode.name} onRenameMode={renameMode} />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={isActive ? 'ghost' : 'default'}
                    size="sm"
                    className={cn(
                      'h-8 rounded-[6px] px-3 disabled:opacity-35',
                      isActive
                        ? 'border border-surface-border bg-surface-control text-white/62 hover:border-surface-border-strong hover:bg-surface-hover hover:text-foreground'
                        : ''
                    )}
                    onClick={() => {
                      void (isActive ? deactivateMode() : activateMode(mode.id));
                    }}
                  >
                    {isActive ? (
                      <Power className="size-3" aria-hidden="true" />
                    ) : (
                      <Play className="size-3" aria-hidden="true" />
                    )}
                    {isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <ModeRowOverflowMenu
                    isPinned={mode.pinnedAt !== null}
                    modeName={mode.name}
                    onDeleteMode={async () => {
                      const deleted = await deleteMode(mode.id);

                      if (deleted) {
                        selectMode(null);
                      }

                      return deleted;
                    }}
                    onSetPinned={(isPinned) => setModePinned(mode.id, isPinned)}
                    showRenameOption={false}
                    triggerClassName="border border-surface-border bg-surface-control text-white/52 hover:border-surface-border-strong hover:bg-surface-hover"
                  />
                </div>
              </div>

              <div className="space-y-7">
                <ModeActionPhaseSection
                  actions={mode.actions.enter}
                  addLabel="Add start action"
                  otherPhaseActions={mode.actions.exit}
                  phase="enter"
                  title="When Mode Starts"
                />
                <ModeActionPhaseSection
                  actions={mode.actions.exit}
                  addLabel="Add end action"
                  otherPhaseActions={mode.actions.enter}
                  phase="exit"
                  title="When Mode Ends"
                />
              </div>
            </div>
          </div>

          <ModeDetailSummaryRail />
        </div>

        <ModeActionComposer />
      </section>
    </ModeActionDialogProvider>
  );
}
