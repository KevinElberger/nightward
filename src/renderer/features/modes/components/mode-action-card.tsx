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
    <div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[8px] border border-surface-border-subtle bg-surface-card px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-surface-border-subtle bg-surface-control text-white/58">
        <ModeActionIcon action={action} FallbackIcon={actionTypeDefinition.Icon} />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {actionTypeDefinition.getTitle(action)}
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-white/38">
          {summaryTokens.map((token, index) => (
            <span key={`${action.id}-${token}`} className="contents">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{token}</span>
            </span>
          ))}
        </div>
        {lifecycleNotice ? (
          <div className="mt-1 text-xs font-medium text-amber-200/55">{lifecycleNotice}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-[4px] px-2 py-1 text-xs font-medium',
            action.enabled
              ? 'bg-status-active/8 text-status-active/80'
              : 'bg-surface-field/70 text-white/34'
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
      className="block w-full rounded-[8px] text-left transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35"
      aria-label={`Edit ${actionTypeDefinition.label} action for ${actionTypeDefinition.getTitle(action)}`}
      onClick={() => {
        onEditAction(action.id);
      }}
    >
      {content}
    </button>
  );
}
