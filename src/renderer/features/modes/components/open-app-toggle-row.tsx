import type { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';

type OpenAppToggleRowProps = {
  description: string;
  disabled: boolean;
  icon: ReactNode;
  isActive: boolean;
  label: string;
  onCheckedChange: (isActive: boolean) => void;
};

export function OpenAppToggleRow({
  description,
  disabled,
  icon,
  isActive,
  label,
  onCheckedChange
}: OpenAppToggleRowProps) {
  return (
    <div className="grid gap-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-surface-border bg-surface-control text-white/58">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-white/38">{description}</span>
        </span>
      </div>

      <Switch
        aria-label={label}
        checked={isActive}
        className="border border-surface-border data-[state=unchecked]:bg-surface-control dark:data-[state=unchecked]:bg-surface-control"
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
