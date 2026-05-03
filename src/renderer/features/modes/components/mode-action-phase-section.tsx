import { Plus, Sparkles, Workflow, type LucideIcon } from 'lucide-react';
import type { ModeAction, ModeActionPhase } from '@shared/modes';
import { Button } from '@/components/ui/button';
import { getModeActionTypeDefinition } from '../mode-action-registry';
import { useModeActionDialog } from './mode-action-dialog-context';
import { ModeActionCard } from './mode-action-card';

type ModeActionPhaseSectionProps = {
  actions: ModeAction[];
  addLabel: string;
  otherPhaseActions: ModeAction[];
  phase: ModeActionPhase;
  title: string;
};

type ModeActionPhaseSectionCopy = {
  EmptyIcon: LucideIcon;
  emptyActionLabel: string;
  emptyDescription: string;
  emptyHeadline: string;
  oppositePhaseNotice: string;
};

const modeActionPhaseSectionCopy = {
  enter: {
    EmptyIcon: Sparkles,
    emptyActionLabel: 'Add your first start action',
    emptyDescription: 'Add an action that runs the moment this mode starts.',
    emptyHeadline: 'No start actions yet',
    oppositePhaseNotice: 'Also opens when mode ends'
  },
  exit: {
    EmptyIcon: Workflow,
    emptyActionLabel: 'Add your first end action',
    emptyDescription: 'Add an action that runs when this mode winds down.',
    emptyHeadline: 'No end actions yet',
    oppositePhaseNotice: 'Also opens when mode starts'
  }
} satisfies Record<ModeActionPhase, ModeActionPhaseSectionCopy>;

export function ModeActionPhaseSection({
  actions,
  addLabel,
  otherPhaseActions,
  phase,
  title
}: ModeActionPhaseSectionProps) {
  const { editAction, openActionTypePicker } = useModeActionDialog();
  const copy = modeActionPhaseSectionCopy[phase];
  const { EmptyIcon } = copy;
  const actionCountLabel = getActionCountLabel(actions.length);

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <h3 className="min-w-0 truncate text-[0.98rem] font-semibold tracking-normal text-foreground">
            {title}
          </h3>
          <span className="shrink-0 rounded-[5px] bg-white/[0.055] px-1.5 py-0.5 text-xs font-medium text-white/40">
            {actionCountLabel}
          </span>
        </div>

        {actions.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 rounded-[5px] px-2 text-white/50 hover:bg-white/[0.055] hover:text-foreground"
            onClick={() => {
              openActionTypePicker(phase);
            }}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {addLabel}
          </Button>
        ) : null}
      </div>

      {actions.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-surface-border bg-white/[0.016] px-6 py-7 text-center">
          <span className="mx-auto flex size-9 items-center justify-center rounded-[7px] border border-surface-border-subtle bg-surface-control text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <EmptyIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="mt-3 text-sm font-semibold text-foreground">{copy.emptyHeadline}</div>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-white/44">
            {copy.emptyDescription}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4 rounded-[6px] border border-surface-border bg-surface-control px-3 text-white/62 hover:border-surface-border-strong hover:bg-surface-hover hover:text-foreground"
            aria-label={copy.emptyActionLabel}
            onClick={() => {
              openActionTypePicker(phase);
            }}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {addLabel}
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actions.map((action) => {
            const lifecycleNotice = getLifecycleNotice(action, otherPhaseActions, copy);

            return (
              <ModeActionCard
                key={action.id}
                action={action}
                lifecycleNotice={lifecycleNotice}
                onEditAction={(actionId) => {
                  editAction(phase, actionId);
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function getActionCountLabel(actionCount: number) {
  return `${actionCount} ${actionCount === 1 ? 'action' : 'actions'}`;
}

function getLifecycleNotice(
  action: ModeAction,
  otherPhaseActions: ModeAction[],
  copy: ModeActionPhaseSectionCopy
) {
  const actionTypeDefinition = getModeActionTypeDefinition(action.type);
  const hasMatchingAction = otherPhaseActions.some((candidate) => {
    if (candidate.id === action.id) {
      return false;
    }

    return actionTypeDefinition.matchesLifecycleAction(action, candidate);
  });

  return hasMatchingAction ? copy.oppositePhaseNotice : undefined;
}
