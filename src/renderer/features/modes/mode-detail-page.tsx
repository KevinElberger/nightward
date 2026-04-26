import { ArrowLeft, Check, Circle, Play, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeActionComposer } from './components/mode-action-composer';
import { ModeActionDialogProvider } from './components/mode-action-dialog-provider';
import { ModeActionPhaseSection } from './components/mode-action-phase-section';
import { ModeDetailTitle } from './components/mode-detail-title';
import { ModeTriggerSummary } from './components/mode-trigger-summary';
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
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="-ml-1 mb-4 h-7 rounded-[4px] px-1.5 text-white/48 hover:bg-surface-hover hover:text-white/82"
              onClick={() => {
                selectMode(null);
              }}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Modes
            </Button>

            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-[5px] border border-surface-border bg-surface-control',
                  isActive
                    ? 'border-status-active/20 bg-status-active/8 text-status-active'
                    : 'text-status-neutral/50'
                )}
              >
                {isActive ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Circle className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <ModeDetailTitle modeId={mode.id} name={mode.name} onRenameMode={renameMode} />
                <p
                  className={cn(
                    'text-sm',
                    isActive ? 'text-status-active/80' : 'text-status-neutral/50'
                  )}
                >
                  {isActive ? 'Active' : 'Ready'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-[4px] px-2.5 text-white/58 hover:bg-surface-hover hover:text-foreground disabled:opacity-35"
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
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
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

          <ModeTriggerSummary />
        </div>

        <ModeActionComposer />
      </section>
    </ModeActionDialogProvider>
  );
}
