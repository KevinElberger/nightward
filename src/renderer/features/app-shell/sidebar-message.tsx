import type { ReactNode } from 'react';

type SidebarMessageProps = {
  description: string;
  icon?: ReactNode;
  title: string;
};

export function SidebarMessage({ description, icon, title }: SidebarMessageProps) {
  return (
    <div className="rounded-[4px] border border-white/[0.055] bg-white/[0.025] p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-white/78">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/42">{description}</p>
    </div>
  );
}
