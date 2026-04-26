import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowField } from './mode-action-editor-layout';

type OpenAppApplicationRowProps = {
  appIconDataUrl: string | null;
  appName: string;
  applicationSelectionError: string | null;
  duplicateApplicationError: string | null;
  duplicateApplicationWarning: string | null;
  hasSelectedApplication: boolean;
  isDisabled: boolean;
  isSelectingApplication: boolean;
  onIconError: () => void;
  onSelectApplication: () => void;
};

export function OpenAppApplicationRow({
  appIconDataUrl,
  appName,
  applicationSelectionError,
  duplicateApplicationError,
  duplicateApplicationWarning,
  hasSelectedApplication,
  isDisabled,
  isSelectingApplication,
  onIconError,
  onSelectApplication
}: OpenAppApplicationRowProps) {
  return (
    <RowField
      align="center"
      controlWidth="auto"
      description="Choose the app Nightward should open."
      isRequired
      label="Application"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex max-w-full items-center justify-end gap-3">
          <span className="flex min-w-0 max-w-[16rem] items-center justify-end gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[4px] text-white/42">
              {appIconDataUrl !== null ? (
                <img
                  src={appIconDataUrl}
                  alt=""
                  className="size-8 object-contain"
                  aria-hidden="true"
                  onError={onIconError}
                />
              ) : (
                <FolderOpen className="size-4" aria-hidden="true" />
              )}
            </span>
            <span className="truncate text-sm font-medium text-foreground">
              {hasSelectedApplication ? appName || 'Selected app' : 'No app selected'}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-[4px] border border-surface-border bg-surface-control px-3 text-white/58 hover:bg-surface-hover hover:text-foreground"
            disabled={isDisabled || isSelectingApplication}
            onClick={onSelectApplication}
          >
            <FolderOpen className="size-3.5" aria-hidden="true" />
            {isSelectingApplication ? 'Choosing...' : hasSelectedApplication ? 'Change' : 'Choose'}
          </Button>
        </div>
        {applicationSelectionError !== null ? (
          <p className="text-xs leading-5 text-destructive/85">{applicationSelectionError}</p>
        ) : null}
        {duplicateApplicationError !== null ? (
          <p className="text-xs leading-5 text-destructive/85">{duplicateApplicationError}</p>
        ) : null}
        {duplicateApplicationWarning !== null ? (
          <p className="text-xs leading-5 text-amber-200/60">{duplicateApplicationWarning}</p>
        ) : null}
      </div>
    </RowField>
  );
}
