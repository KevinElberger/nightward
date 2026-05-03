import type { ReactNode } from 'react';

type SidebarMessageProps = {
  description: string;
  icon?: ReactNode;
  title: string;
};

export function SidebarMessage({ description, icon, title }: SidebarMessageProps) {
  return (
    <div className="rounded-[7px] border border-white/[0.065] bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="flex items-center gap-1.5 text-sm font-medium text-white/76">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/44">{description}</p>
    </div>
  );
}
