import { ChevronRight, X } from 'lucide-react';
import type { ModeActionPhase } from '@shared/modes';
import { availableModeActionTypes, type ModeActionType } from '../mode-action-registry';
import { Button } from '@/components/ui/button';

type ModeActionTypePickerProps = {
  onSelectActionType: (actionType: ModeActionType) => void;
  onClose: () => void;
  phase: ModeActionPhase;
};

export function ModeActionTypePicker({
  onClose,
  onSelectActionType,
  phase
}: ModeActionTypePickerProps) {
  const description =
    phase === 'enter'
      ? 'Choose what should happen when this mode starts.'
      : 'Choose what should happen when this mode ends.';

  return (
    <div className="overflow-hidden bg-card">
      <div className="border-b border-surface-border px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="rounded-[6px] border border-surface-border bg-white/[0.035] text-white/58 hover:border-surface-border-strong hover:bg-white/[0.06] hover:text-foreground"
            aria-label="Close action composer"
            onClick={onClose}
          >
            <X className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-normal text-foreground">
          Choose an action
        </h3>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/46">{description}</p>
      </div>

      <div className="p-3">
        {availableModeActionTypes.map((actionTypeDefinition) => (
          <button
            key={actionTypeDefinition.type}
            type="button"
            className="group grid min-h-16 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[7px] border border-transparent px-3 py-3 text-left transition-[border-color,background-color,color] hover:border-surface-border-subtle hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35"
            onClick={() => {
              onSelectActionType(actionTypeDefinition.type);
            }}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-surface-border-subtle bg-white/[0.035] text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <actionTypeDefinition.Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium tracking-normal text-foreground">
                {actionTypeDefinition.label}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-white/44">
                {actionTypeDefinition.description}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-white/22 transition-transform group-hover:translate-x-0.5 group-hover:text-white/38"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
