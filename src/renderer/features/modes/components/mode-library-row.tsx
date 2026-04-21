import { Check, Circle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SavedMode } from '../../../../shared/modes';
import { cn } from '@/lib/utils';
import { ModeRowOverflowMenu } from './mode-row-overflow-menu';

type ModeLibraryRowProps = {
  isActive: boolean;
  isSelected: boolean;
  mode: SavedMode;
  onActivateMode: (id: string) => Promise<boolean>;
  onSelectMode: (modeId: string | null) => void;
};

export function ModeLibraryRow({
  isActive,
  isSelected,
  mode,
  onActivateMode,
  onSelectMode
}: ModeLibraryRowProps) {
  return (
    <div
      className={cn(
        'group/row grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 transition-colors',
        isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.025]'
      )}
    >
      <button
        type="button"
        className="app-no-drag flex min-w-0 items-center gap-3 text-left"
        onClick={() => {
          onSelectMode(mode.id);
        }}
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.055] bg-white/[0.025]',
            isActive ? 'text-primary' : 'text-white/32'
          )}
        >
          {isActive ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Circle className="size-3" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{mode.name}</span>
          <span className="mt-0.5 block text-xs text-white/34">
            {isActive ? 'Active' : 'Ready'}
          </span>
        </span>
      </button>

      <div className="app-no-drag flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isActive}
          className="h-8 rounded-[4px] px-2.5 text-white/48 hover:bg-white/[0.05] hover:text-foreground disabled:opacity-35"
          onClick={() => {
            void onActivateMode(mode.id);
          }}
        >
          <Play className="size-3" aria-hidden="true" />
          {isActive ? 'Active' : 'Activate'}
        </Button>
        <ModeRowOverflowMenu modeName={mode.name} />
      </div>
    </div>
  );
}
