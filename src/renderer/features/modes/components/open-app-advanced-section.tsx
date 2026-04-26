import { Input } from '@/components/ui/input';
import { RowField, SettingsPanel } from './mode-action-editor-layout';

type OpenAppAdvancedSectionProps = {
  bundleId: string;
  disabled: boolean;
  onBundleIdChange: (bundleId: string) => void;
};

export function OpenAppAdvancedSection({
  bundleId,
  disabled,
  onBundleIdChange
}: OpenAppAdvancedSectionProps) {
  return (
    <SettingsPanel>
      <RowField
        description="Optional macOS identifier for more reliable app matching."
        htmlFor="mode-open-app-bundle-id"
        label="Bundle ID"
      >
        <Input
          id="mode-open-app-bundle-id"
          value={bundleId}
          className="h-9 rounded-[4px] border-surface-border bg-surface-field text-sm text-foreground shadow-none placeholder:text-white/24 focus-visible:border-ring/70 focus-visible:ring-ring/35"
          disabled={disabled}
          placeholder="com.spotify.client"
          onChange={(event) => {
            onBundleIdChange(event.target.value);
          }}
        />
      </RowField>
    </SettingsPanel>
  );
}
