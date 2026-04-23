import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeRenameControl } from './mode-rename-control';

type ModeDetailTitleProps = {
  modeId: string;
  name: string;
  onRenameMode: (id: string, name: string) => Promise<unknown>;
};

export function ModeDetailTitle({ modeId, name, onRenameMode }: ModeDetailTitleProps) {
  return (
    <ModeRenameControl
      modeId={modeId}
      name={name}
      onRenameMode={onRenameMode}
      variant="title"
    >
      {({ startRenaming, triggerButtonClassName, triggerButtonSize }) => (
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-2xl font-semibold tracking-normal text-foreground">
            {name}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size={triggerButtonSize}
            className={triggerButtonClassName}
            aria-label="Rename mode"
            title="Rename mode"
            onClick={startRenaming}
          >
            <Pencil className="size-3" aria-hidden="true" />
          </Button>
        </div>
      )}
    </ModeRenameControl>
  );
}
