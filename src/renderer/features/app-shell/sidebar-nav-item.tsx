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
        'group relative flex h-10 w-full items-center justify-between rounded-[4px] px-2.5 text-left text-sm transition-colors',
        disabled
          ? 'cursor-default text-white/24'
          : isSelected
            ? 'bg-white/[0.055] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : 'text-white/68 hover:bg-white/[0.045]'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {isActive ? (
        <span
          className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 rounded-full bg-status-active shadow-[0_0_14px_rgba(74,222,128,0.7)]"
          aria-hidden="true"
        />
      ) : null}

      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-[3px] border border-white/[0.05] bg-white/[0.025]',
              disabled ? 'text-white/25' : 'text-primary'
            )}
          >
            {icon}
          </span>
        ) : (
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              isActive
                ? 'bg-status-active shadow-[0_0_14px_rgba(74,222,128,0.68)]'
                : 'bg-status-neutral/28'
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
