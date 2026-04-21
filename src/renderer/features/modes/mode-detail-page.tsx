import { useRef, type ReactNode } from 'react';
import { ArrowLeft, Bolt, Check, Circle, Play, Power, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelection } from '../app-shell/use-app-selection';
import { ModeDetailTitle, type ModeDetailTitleHandle } from './components/mode-detail-title';
import { ModeRowOverflowMenu } from './components/mode-row-overflow-menu';
import { useModes } from './use-modes-context';

export function ModeDetailPage() {
  const { selectMode, selectedModeId } = useAppSelection();
  const { activateMode, activeModeId, deactivateMode, modes, renameMode } = useModes();
  const mode = modes.find((savedMode) => savedMode.id === selectedModeId) ?? null;
  const titleRef = useRef<ModeDetailTitleHandle>(null);

  if (mode === null) {
    return null;
  }

  const isActive = mode.id === activeModeId;
  const startRenaming = () => titleRef.current?.startRenaming();

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="-ml-1 mb-4 h-7 rounded-[4px] px-1.5 text-white/48 hover:bg-white/[0.045] hover:text-white/82"
            onClick={() => {
              selectMode(null);
            }}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Modes
          </Button>

          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-[5px] border border-white/[0.07] bg-white/[0.035]',
                isActive
                  ? 'border-status-active/20 bg-status-active/8 text-status-active'
                  : 'text-status-neutral/50'
              )}
            >
              {isActive ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Circle className="size-3.5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <ModeDetailTitle
                ref={titleRef}
                modeId={mode.id}
                name={mode.name}
                onRenameMode={renameMode}
              />
              <p
                className={cn(
                  'text-sm',
                  isActive ? 'text-status-active/80' : 'text-status-neutral/50'
                )}
              >
                {isActive ? 'Active' : 'Ready'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-[4px] px-2.5 text-white/58 hover:bg-white/[0.035] hover:text-foreground disabled:opacity-35"
            onClick={() => {
              void (isActive ? deactivateMode() : activateMode(mode.id));
            }}
          >
            {isActive ? (
              <Power className="size-3" aria-hidden="true" />
            ) : (
              <Play className="size-3" aria-hidden="true" />
            )}
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <ModeRowOverflowMenu modeName={mode.name} onRename={startRenaming} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <ModeDetailSection
          icon={<Bolt className="size-4" aria-hidden="true" />}
          title="Actions"
          meta="0 configured"
          items={['Apps', 'System', 'Scripts']}
        />
        <ModeDetailSection
          icon={<Workflow className="size-4" aria-hidden="true" />}
          title="Triggers"
          meta="Manual"
          items={['Schedule', 'App launch', 'Shortcut']}
        />
        <ModeDetailSection
          title="Exit behavior"
          meta="Default"
          items={['Restore previous state', 'Leave apps unchanged', 'Run cleanup']}
        />
      </div>
    </section>
  );
}

function ModeDetailSection({
  icon,
  items,
  meta,
  title
}: {
  icon?: ReactNode;
  items: string[];
  meta: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-white/[0.075] bg-white/[0.042] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.016] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.065] bg-white/[0.04] text-primary">
              {icon}
            </span>
          ) : null}
          <h3 className="truncate text-sm font-semibold tracking-normal text-foreground">
            {title}
          </h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-white/34">{meta}</span>
      </div>

      <div className="divide-y divide-white/[0.045]">
        {items.map((item) => (
          <div key={item} className="flex h-12 w-full items-center justify-between px-4 text-left">
            <span className="text-sm font-medium text-white/72">{item}</span>
            <span className="text-xs text-white/30">Not set</span>
          </div>
        ))}
      </div>
    </section>
  );
}
