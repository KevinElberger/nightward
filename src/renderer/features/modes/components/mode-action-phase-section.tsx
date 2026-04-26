import { Plus, Sparkles, Sunrise, Sunset, Workflow, type LucideIcon } from 'lucide-react';
import type { ModeAction, ModeActionPhase } from '@shared/modes';
import { Button } from '@/components/ui/button';
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
  HeaderIcon: LucideIcon;
  emptyActionLabel: string;
  emptyDescription: string;
  emptyExamples: string;
  emptyHeadline: string;
  oppositePhaseNotice: string;
};

const modeActionPhaseSectionCopy = {
  enter: {
    EmptyIcon: Sparkles,
    HeaderIcon: Sunrise,
    emptyActionLabel: 'Add your first start action',
    emptyDescription: 'Add an action that runs the moment this mode starts.',
    emptyExamples: 'Open your writing app, start focus music, or launch a timer.',
    emptyHeadline: 'Start this mode with momentum',
    oppositePhaseNotice: 'Also opens when mode ends'
  },
  exit: {
    EmptyIcon: Workflow,
    HeaderIcon: Sunset,
    emptyActionLabel: 'Add your first end action',
    emptyDescription: 'Add an action that runs when this mode winds down.',
    emptyExamples: 'Bring chat back, open notes, or start a wrap-up playlist.',
    emptyHeadline: 'End this mode with intention',
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
  const { EmptyIcon, HeaderIcon } = copy;
  const actionCountLabel = getActionCountLabel(actions.length);

  return (
    <section className="overflow-hidden rounded-[6px] border border-surface-border bg-surface-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between gap-3 border-b border-surface-border-subtle bg-surface-panel-muted px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-surface-border-subtle bg-surface-control text-primary">
            <HeaderIcon className="size-4" aria-hidden="true" />
          </span>
          <h3 className="truncate text-sm font-semibold tracking-normal text-foreground">
            {title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-white/34">{actionCountLabel}</span>
          {actions.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-7 rounded-[4px] px-2 text-white/48 hover:bg-surface-hover hover:text-foreground"
              onClick={() => {
                openActionTypePicker(phase);
              }}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {addLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="px-4 py-8">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <span className="flex size-10 items-center justify-center rounded-[5px] border border-primary/14 bg-primary/7 text-primary/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <EmptyIcon className="size-4" aria-hidden="true" />
            </span>
            <div className="mt-3 text-sm font-semibold text-foreground">{copy.emptyHeadline}</div>
            <p className="mt-1 max-w-xs text-xs leading-5 text-white/38">{copy.emptyDescription}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-white/30">{copy.emptyExamples}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-4 rounded-[4px] border border-surface-border bg-surface-control px-3 text-white/58 hover:bg-surface-hover hover:text-foreground"
              aria-label={copy.emptyActionLabel}
              onClick={() => {
                openActionTypePicker(phase);
              }}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {addLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 p-3">
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
  return hasMatchingOpenAppAction(action, otherPhaseActions) ? copy.oppositePhaseNotice : undefined;
}

function hasMatchingOpenAppAction(action: ModeAction, actions: ModeAction[]) {
  return actions.some((candidate) => {
    if (candidate.id === action.id) {
      return false;
    }

    const actionBundleId = normalizeComparableValue(action.bundleId ?? '');
    const candidateBundleId = normalizeComparableValue(candidate.bundleId ?? '');

    if (actionBundleId !== '' && candidateBundleId !== '') {
      return actionBundleId === candidateBundleId;
    }

    return normalizeComparableValue(action.appPath) === normalizeComparableValue(candidate.appPath);
  });
}

function normalizeComparableValue(value: string) {
  return value.trim().toLowerCase();
}
