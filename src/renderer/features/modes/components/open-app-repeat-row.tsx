import type { ModeActionRepeatPolicy } from '@shared/modes';
import { SettingGroup } from './mode-action-editor-layout';

type OpenAppRepeatRowProps = {
  disabled: boolean;
  onRepeatPolicyChange: (repeatPolicy: ModeActionRepeatPolicy) => void;
  repeatPolicy: ModeActionRepeatPolicy;
};

export function OpenAppRepeatRow({
  disabled,
  onRepeatPolicyChange,
  repeatPolicy
}: OpenAppRepeatRowProps) {
  return (
    <SettingGroup
      description="Decide whether this runs every time or only once each day."
      label="Repeat"
    >
      <div className="inline-flex rounded-[4px] border border-surface-border bg-surface-control p-1">
        <RepeatPolicyButton
          isActive={repeatPolicy === 'every-activation'}
          label="Every activation"
          disabled={disabled}
          onClick={() => {
            onRepeatPolicyChange('every-activation');
          }}
        />
        <RepeatPolicyButton
          isActive={repeatPolicy === 'once-per-day'}
          label="Once per day"
          disabled={disabled}
          onClick={() => {
            onRepeatPolicyChange('once-per-day');
          }}
        />
      </div>
    </SettingGroup>
  );
}

function RepeatPolicyButton({
  disabled,
  isActive,
  label,
  onClick
}: {
  disabled: boolean;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`rounded-[3px] px-3 py-1.5 text-sm transition-[background-color,color] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 ${
        isActive
          ? 'bg-surface-active text-foreground'
          : 'text-white/56 hover:bg-surface-hover hover:text-foreground'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
