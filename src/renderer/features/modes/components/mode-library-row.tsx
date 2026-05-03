import { Play, Power, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SavedMode } from '../../../../shared/modes';
import { cn } from '@/lib/utils';
import { ModeRowOverflowMenu } from './mode-row-overflow-menu';
import { ModeRenameControl } from './mode-rename-control';

type ModeLibraryRowProps = {
  isActive: boolean;
  isSelected: boolean;
  mode: SavedMode;
  onActivateMode: (id: string) => Promise<boolean>;
  onDeactivateMode: () => Promise<boolean>;
  onDeleteMode: (id: string) => Promise<boolean>;
  onRenameMode: (id: string, name: string) => Promise<SavedMode | null>;
  onSelectMode: (modeId: string | null) => void;
  onSetPinned: (id: string, isPinned: boolean) => Promise<SavedMode | null>;
};

export function ModeLibraryRow({
  isActive,
  isSelected,
  mode,
  onActivateMode,
  onDeactivateMode,
  onDeleteMode,
  onRenameMode,
  onSelectMode,
  onSetPinned
}: ModeLibraryRowProps) {
  const actionCount = mode.actions.enter.length + mode.actions.exit.length;
  const metadataItems = [
    { className: '', label: 'Manual trigger' },
    { className: '', label: getActionCountLabel(actionCount) },
    ...(isActive ? [{ className: 'text-status-active/78', label: 'Active now' }] : []),
    ...(mode.pinnedAt === null ? [] : [{ className: '', label: 'Pinned' }])
  ];

  return (
    <div
      className={cn(
        'group/row relative grid min-h-[4.75rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-surface-border-subtle px-5 transition-[background-color,box-shadow] first:border-t-0',
        isSelected
          ? 'bg-white/[0.045] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]'
          : 'hover:bg-white/[0.028]'
      )}
    >
      <ModeRenameControl
        modeId={mode.id}
        name={mode.name}
        onRenameMode={onRenameMode}
        variant="row"
        leadingContent={<ModeLibraryRowMark isActive={isActive} />}
      >
        {({ startRenaming }) => (
          <>
            <button
              type="button"
              aria-label={`Open details for ${mode.name}`}
              className="app-no-drag absolute inset-0 z-0 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35"
              onClick={() => {
                onSelectMode(mode.id);
              }}
            />

            <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3.5">
              <ModeLibraryRowMark isActive={isActive} />
              <div className="min-w-0">
                <span className="block truncate text-[0.95rem] font-semibold leading-5 text-foreground">
                  {mode.name}
                </span>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-white/42">
                  {metadataItems.map((item, index) => (
                    <span key={item.label} className="inline-flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-white/18" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      <span className={item.className}>{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="app-no-drag relative z-20 flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 rounded-[6px] border px-2.5 disabled:opacity-35',
                  isActive
                    ? 'border-surface-border bg-surface-control text-white/62 hover:border-surface-border-strong hover:bg-surface-hover hover:text-foreground'
                    : 'border-surface-border bg-white/[0.04] text-white/70 hover:border-surface-border-strong hover:bg-white/[0.065] hover:text-foreground'
                )}
                onClick={() => {
                  void (isActive ? onDeactivateMode() : onActivateMode(mode.id));
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
                onDeleteMode={() => onDeleteMode(mode.id)}
                onRename={startRenaming}
                onSetPinned={(isPinned) => onSetPinned(mode.id, isPinned)}
                triggerClassName="border border-transparent bg-transparent text-white/36 hover:border-surface-border hover:bg-surface-control hover:text-foreground"
              />
            </div>
          </>
        )}
      </ModeRenameControl>
    </div>
  );
}

type ModeLibraryRowMarkProps = {
  isActive: boolean;
};

function ModeLibraryRowMark({ isActive }: ModeLibraryRowMarkProps) {
  return (
    <span
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-surface-border-subtle bg-white/[0.03] text-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        isActive ? 'border-white/[0.11] text-white/72' : ''
      )}
      aria-hidden="true"
    >
      <Workflow className="size-3.5" />
      {isActive ? (
        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-background bg-status-active" />
      ) : null}
    </span>
  );
}

function getActionCountLabel(actionCount: number) {
  return `${actionCount} ${actionCount === 1 ? 'action' : 'actions'}`;
}
