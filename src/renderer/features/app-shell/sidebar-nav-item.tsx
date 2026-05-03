import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarNavItemProps = {
  disabled?: boolean;
  icon?: ReactNode;
  isActive?: boolean;
  isSelected: boolean;
  label: string;
  onClick?: () => void;
};

export function SidebarNavItem({
  disabled = false,
  icon,
  isActive = false,
  isSelected,
  label,
  onClick
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'group relative flex h-10 w-full items-center justify-between rounded-[6px] border border-transparent px-2.5 text-left text-sm transition-[background-color,border-color,color,box-shadow]',
        disabled
          ? 'cursor-default text-white/28'
          : isSelected
            ? 'border-white/[0.085] bg-white/[0.07] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_10px_24px_rgba(0,0,0,0.16)]'
            : isActive
              ? 'border-white/[0.055] bg-white/[0.032] text-white/78 hover:border-white/[0.07] hover:bg-white/[0.05]'
              : 'text-white/62 hover:border-white/[0.055] hover:bg-white/[0.045] hover:text-white/82'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-white/[0.06] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]',
              disabled ? 'text-white/26' : isSelected ? 'text-white/86' : 'text-white/54'
            )}
          >
            {icon}
          </span>
        ) : (
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full border',
              isActive
                ? 'border-status-active/35 bg-status-active/70'
                : 'border-transparent bg-status-neutral/28'
            )}
          />
        )}
        <span className="min-w-0 truncate font-medium">{label}</span>
      </span>

      <ChevronRight
        className={cn(
          'size-3.5 shrink-0 transition-opacity',
          disabled ? 'opacity-0' : isSelected ? 'opacity-55' : 'opacity-0 group-hover:opacity-35'
        )}
        aria-hidden="true"
      />
    </button>
  );
}
