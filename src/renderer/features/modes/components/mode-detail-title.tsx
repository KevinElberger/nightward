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
    <ModeRenameControl modeId={modeId} name={name} onRenameMode={onRenameMode} variant="title">
      {({ startRenaming, triggerButtonClassName, triggerButtonSize }) => (
        <div className="flex h-[3.1rem] min-w-0 flex-1 items-center gap-2.5">
          <h2 className="min-w-0 truncate border-b border-transparent font-heading text-[2.45rem] font-semibold leading-[1.05] tracking-normal text-foreground">
            {name}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size={triggerButtonSize}
            className={`${triggerButtonClassName} -translate-y-0.5`}
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
