import { ChevronRight } from 'lucide-react';
import type { ModeAction } from '@shared/modes';
import { cn } from '@/lib/utils';
import { getModeActionTypeDefinition } from '../mode-action-registry';
import { ModeActionIcon } from './mode-action-icon';

type ModeActionCardProps = {
  action: ModeAction;
  lifecycleNotice?: string;
  onEditAction?: (actionId: string) => void;
};

export function ModeActionCard({ action, lifecycleNotice, onEditAction }: ModeActionCardProps) {
  const actionTypeDefinition = getModeActionTypeDefinition(action.type);
  const summaryTokens = actionTypeDefinition.getSummaryTokens(action);
  const content = (
    <div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[7px] border border-surface-border-subtle bg-white/[0.026] px-3 py-2.5 transition-[background-color,border-color] group-hover/action:border-surface-border group-hover/action:bg-white/[0.045]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-surface-border-subtle bg-surface-control text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
        <ModeActionIcon action={action} FallbackIcon={actionTypeDefinition.Icon} />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {actionTypeDefinition.getTitle(action)}
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-white/42">
          {summaryTokens.map((token, index) => (
            <span key={`${action.id}-${token}`} className="contents">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{token}</span>
            </span>
          ))}
        </div>
        {lifecycleNotice ? (
          <div className="mt-1 text-xs font-medium text-status-warning/70">{lifecycleNotice}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-[4px] px-2 py-1 text-xs font-medium',
            action.enabled
              ? 'border border-status-active/15 bg-status-active/10 text-status-active/80'
              : 'border border-surface-border-subtle bg-surface-field/70 text-white/38'
          )}
        >
          {action.enabled ? 'Enabled' : 'Disabled'}
        </span>
        {onEditAction ? (
          <ChevronRight className="size-4 shrink-0 text-white/22" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  );

  if (onEditAction === undefined) {
    return content;
  }

  return (
    <button
      type="button"
      className="group/action block w-full rounded-[7px] text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35"
      aria-label={`Edit ${actionTypeDefinition.label} action for ${actionTypeDefinition.getTitle(action)}`}
      onClick={() => {
        onEditAction(action.id);
      }}
    >
      {content}
    </button>
  );
}
