import { Bolt, Settings2, SlidersHorizontal, Workflow } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModes } from '../modes/use-modes-context';
import { useAppSelection } from './use-app-selection';
import { SidebarBrand } from './sidebar-brand';
import { SidebarCurrentMode } from './sidebar-current-mode';
import { SidebarFooter } from './sidebar-footer';
import { SidebarModeList } from './sidebar-mode-list';
import { SidebarNavItem } from './sidebar-nav-item';
import { SidebarNavSection } from './sidebar-nav-section';

export function AppSidebar() {
  const { activeModeId, error, isLoading, modes } = useModes();
  const { selectMode, selectedModeId } = useAppSelection();
  const activeMode = modes.find((mode) => mode.id === activeModeId) ?? null;

  return (
    <aside className="relative flex h-screen min-h-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#050506]/95 text-sidebar-foreground shadow-[inset_-1px_0_0_rgba(255,255,255,0.025),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 top-0 h-56 w-48 rotate-12 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.035),rgba(255,255,255,0))] blur-sm"
        aria-hidden="true"
      />

      <SidebarBrand />
      <SidebarCurrentMode activeMode={activeMode} />

      <ScrollArea className="relative mt-3 min-h-0 flex-1 px-3 pb-3">
        <nav className="space-y-px">
          <SidebarNavItem
            icon={<SlidersHorizontal className="size-3.5" aria-hidden="true" />}
            isSelected={selectedModeId === null}
            label="Modes"
            onClick={() => {
              selectMode(null);
            }}
          />
        </nav>

        <SidebarModeList
          error={error}
          isLoading={isLoading}
          modes={modes}
          onSelectMode={selectMode}
          selectedModeId={selectedModeId}
        />

        <SidebarNavSection
          title="Automation"
          items={[
            {
              icon: <Bolt className="size-3.5" aria-hidden="true" />,
              label: 'Actions'
            },
            {
              icon: <Workflow className="size-3.5" aria-hidden="true" />,
              label: 'Triggers'
            }
          ]}
        />

        <SidebarNavSection
          title="System"
          items={[
            {
              icon: <Settings2 className="size-3.5" aria-hidden="true" />,
              label: 'Settings'
            }
          ]}
        />
      </ScrollArea>

      <SidebarFooter />
    </aside>
  );
}
