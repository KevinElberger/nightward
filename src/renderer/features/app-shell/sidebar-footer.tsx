import { Monitor } from 'lucide-react';

export function SidebarFooter() {
  return (
    <div className="relative border-t border-white/[0.065] bg-white/[0.015] p-3">
      <div className="flex h-9 items-center gap-2.5 rounded-[6px] border border-transparent px-2 text-white/42">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-white/[0.06] bg-white/[0.035]">
          <Monitor className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate text-xs font-medium text-white/58">Local</span>
        <span
          className="ml-auto size-1.5 rounded-full bg-status-active/75 shadow-[0_0_12px_rgba(69,212,131,0.45)]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
