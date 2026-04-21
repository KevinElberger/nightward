import { Monitor } from 'lucide-react';

export function SidebarFooter() {
  return (
    <div className="relative border-t border-white/[0.06] p-3">
      <div className="flex h-9 items-center gap-2.5 rounded-[4px] px-2 text-white/42">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-[3px] border border-white/[0.055] bg-white/[0.025]">
          <Monitor className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate text-xs font-medium text-white/58">Local</span>
        <span className="ml-auto size-1.5 rounded-full bg-white/20" aria-hidden="true" />
      </div>
    </div>
  );
}
