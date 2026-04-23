import { AppWindow } from 'lucide-react';
import type { ModeAction } from '@shared/modes';
import { cn } from '@/lib/utils';

export function ModeActionCard({ action }: { action: ModeAction }) {
  return (
    <div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[5px] border border-white/[0.065] bg-white/[0.028] px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.065] bg-white/[0.035] text-white/58">
        <AppWindow className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{action.appName}</div>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-white/38">
          <span>Open app</span>
          <span aria-hidden="true">·</span>
          <span>{getRepeatPolicyLabel(action.repeatPolicy)}</span>
          {action.onlyOpenIfNotRunning ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Only if closed</span>
            </>
          ) : null}
        </div>
      </div>
      <span
        className={cn(
          'rounded-[4px] border px-2 py-1 text-xs font-medium',
          action.enabled
            ? 'border-status-active/18 bg-status-active/8 text-status-active/80'
            : 'border-white/[0.055] bg-white/[0.025] text-white/34'
        )}
      >
        {action.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

function getRepeatPolicyLabel(repeatPolicy: ModeAction['repeatPolicy']) {
  return repeatPolicy === 'once-per-day' ? 'Once per day' : 'Every activation';
}
