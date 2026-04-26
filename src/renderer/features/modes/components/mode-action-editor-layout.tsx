import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export function SettingsPanel({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function SectionButton({
  icon,
  isActive,
  label,
  onClick
}: {
  icon: ReactNode;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-sm transition-[background-color,color] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 ${
        isActive
          ? 'bg-surface-active text-foreground'
          : 'text-white/56 hover:bg-surface-hover hover:text-foreground'
      }`}
      onClick={onClick}
    >
      <span className="text-white/48">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function RowField({
  align = 'start',
  children,
  controlWidth = 'stretch',
  description,
  htmlFor,
  isRequired = false,
  label
}: {
  align?: 'center' | 'start';
  controlWidth?: 'auto' | 'stretch';
  children: ReactNode;
  description: string;
  htmlFor?: string;
  isRequired?: boolean;
  label: string;
}) {
  return (
    <div
      className={`grid gap-3 py-2 sm:gap-5 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      } ${
        controlWidth === 'auto'
          ? 'sm:grid-cols-[minmax(13rem,1fr)_auto]'
          : 'sm:grid-cols-[minmax(13rem,0.85fr)_minmax(24rem,1.15fr)]'
      }`}
    >
      <div>
        <div className="flex items-center gap-1.5">
          {htmlFor === undefined ? (
            <div className="text-sm font-medium text-foreground">{label}</div>
          ) : (
            <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
              {label}
            </Label>
          )}
          {isRequired ? (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 text-xs leading-5 text-white/38">{description}</div>
      </div>
      <div
        className={`flex min-w-0 justify-end ${
          controlWidth === 'auto' ? 'justify-self-end' : 'w-full'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingGroup({
  children,
  description,
  label
}: {
  children: ReactNode;
  description: string;
  label: string;
}) {
  return (
    <div className="grid gap-3 py-2 sm:grid-cols-[minmax(13rem,1fr)_auto] sm:items-center sm:gap-5">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-xs leading-5 text-white/38">{description}</div>
      </div>
      <div className="flex min-w-0 justify-end justify-self-end">{children}</div>
    </div>
  );
}
