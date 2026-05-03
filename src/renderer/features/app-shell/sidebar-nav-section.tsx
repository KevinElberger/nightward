import type { ReactNode } from 'react';
import { SidebarNavItem } from './sidebar-nav-item';

type SidebarNavSectionItem = {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
};

type SidebarNavSectionProps = {
  items: SidebarNavSectionItem[];
  title: string;
};

export function SidebarNavSection({ items, title }: SidebarNavSectionProps) {
  return (
    <section className="relative mt-4">
      <div className="px-1.5 py-2">
        <p className="text-[0.68rem] font-medium uppercase tracking-normal text-white/38">
          {title}
        </p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.label}
            disabled={item.disabled}
            icon={item.icon}
            isSelected={false}
            label={item.label}
          />
        ))}
      </nav>
    </section>
  );
}
