import { Check, Circle, Play, Power } from 'lucide-react';
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
  const statusIcon = isActive ? (
    <Check className="size-3.5" aria-hidden="true" />
  ) : (
    <Circle className="size-3" aria-hidden="true" />
  );
  const statusLabel = isActive ? 'Active' : 'Ready';

  return (
    <div
      className={cn(
        'group/row relative grid min-h-[3.75rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 transition-colors',
        isSelected ? 'bg-surface-active' : 'bg-surface-card hover:bg-surface-hover'
      )}
    >
      <ModeRenameControl
        modeId={mode.id}
        name={mode.name}
        onRenameMode={onRenameMode}
        variant="row"
        leadingContent={
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-surface-border-subtle bg-surface-field',
              isActive
                ? 'border-status-active/20 bg-status-active/8 text-status-active'
                : 'text-status-neutral/50'
            )}
          >
            {statusIcon}
          </span>
        }
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

            <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-surface-border-subtle bg-surface-field',
                  isActive
                    ? 'border-status-active/20 bg-status-active/8 text-status-active'
                    : 'text-status-neutral/50'
                )}
              >
                {statusIcon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {mode.name}
                </span>
                <span
                  className={cn(
                    'mt-0.5 block text-xs',
                    isActive ? 'text-status-active/80' : 'text-status-neutral/50'
                  )}
                >
                  {statusLabel}
                </span>
              </span>
            </div>

            <div className="app-no-drag relative z-20 flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-[4px] px-2.5 text-white/48 hover:bg-surface-hover hover:text-foreground disabled:opacity-35"
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
              />
            </div>
          </>
        )}
      </ModeRenameControl>
    </div>
  );
}
