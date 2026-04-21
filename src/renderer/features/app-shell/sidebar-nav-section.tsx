import type { ReactNode } from 'react';
import { SidebarNavItem } from './sidebar-nav-item';

type SidebarNavSectionItem = {
  icon: ReactNode;
  label: string;
};

type SidebarNavSectionProps = {
  items: SidebarNavSectionItem[];
  title: string;
};

export function SidebarNavSection({ items, title }: SidebarNavSectionProps) {
  return (
    <section className="relative mt-3">
      <div className="px-1 py-2">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-white/36">
          {title}
        </p>
      </div>
      <nav className="space-y-px">
        {items.map((item) => (
          <SidebarNavItem key={item.label} icon={item.icon} isSelected={false} label={item.label} />
        ))}
      </nav>
    </section>
  );
}
