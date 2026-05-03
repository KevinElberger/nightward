import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ArrowLeft, Link2, Power, Tag, Trash2, X } from 'lucide-react';
import type { ModeActionPhase, OpenUrlModeAction, OpenUrlModeActionInput } from '@shared/modes';
import { normalizeOpenUrl } from '@shared/open-url';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RowField, SettingsPanel } from './mode-action-editor-layout';
import { OpenAppRepeatRow } from './open-app-repeat-row';
import { OpenAppToggleRow } from './open-app-toggle-row';

type ModeOpenUrlActionEditorProps = {
  action: OpenUrlModeAction | null;
  isDeletingAction: boolean;
  isSavingAction: boolean;
  onBack?: () => void;
  onClose: () => void;
  onDeleteAction?: () => Promise<void>;
  onSaveAction: (action: OpenUrlModeActionInput) => Promise<void>;
  phase: ModeActionPhase;
};

export function ModeOpenUrlActionEditor({
  action,
  isDeletingAction,
  isSavingAction,
  onBack,
  onClose,
  onDeleteAction,
  onSaveAction,
  phase
}: ModeOpenUrlActionEditorProps) {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(() => action?.url ?? '');
  const [label, setLabel] = useState(() => action?.label ?? '');
  const [enabled, setEnabled] = useState(() => action?.enabled ?? true);
  const [repeatPolicy, setRepeatPolicy] = useState<OpenUrlModeActionInput['repeatPolicy']>(
    () => action?.repeatPolicy ?? 'every-activation'
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const normalizedUrl = normalizeOpenUrl(url);
  const normalizedLabel = label.trim();
  const isEditing = action !== null;
  const isActionLocked = isSavingAction || isDeletingAction;
  const canSaveAction = !isActionLocked && normalizedUrl !== null;
  const description = useMemo(
    () =>
      phase === 'enter'
        ? 'Open this link when the mode starts.'
        : 'Open this link when the mode ends.',
    [phase]
  );

  useEffect(() => {
    const urlInput = urlInputRef.current;

    if (urlInput === null || urlInput.disabled) {
      return;
    }

    urlInput.focus();
    urlInput.setSelectionRange(urlInput.value.length, urlInput.value.length);
  }, []);

  const handleSave = async () => {
    if (!canSaveAction || normalizedUrl === null) {
      return;
    }

    await onSaveAction({
      enabled,
      ...(normalizedLabel === '' ? {} : { label: normalizedLabel }),
      repeatPolicy,
      type: 'open-url',
      url: normalizedUrl
    });
  };

  const handleUrlBlur = () => {
    setUrlValidationError(getOpenUrlValidationError(url));
  };

  const handleConfirmDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (onDeleteAction === undefined || isDeletingAction || isSavingAction) {
      return;
    }

    await onDeleteAction();
  };

  return (
    <AlertDialog
      open={isDeleteDialogOpen}
      onOpenChange={(isOpen) => {
        if (!isDeletingAction) {
          setIsDeleteDialogOpen(isOpen);
        }
      }}
    >
      <form
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-card"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div className="border-b border-surface-border px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {onBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-[6px] border border-surface-border bg-white/[0.035] text-white/58 hover:border-surface-border-strong hover:bg-white/[0.06] hover:text-foreground"
                  aria-label="Choose another action type"
                  onClick={onBack}
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-[6px] border border-surface-border bg-white/[0.035] text-white/56 hover:border-surface-border-strong hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Close action composer"
              onClick={onClose}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-normal text-foreground">Open a URL</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/46">{description}</p>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">
          <SettingsPanel>
            <RowField
              description="Paste a web link or Spotify URI for Nightward to open."
              htmlFor="mode-open-url-url"
              isRequired
              label="URL"
            >
              <div className="w-full">
                <div className="relative">
                  <Link2
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/28"
                    aria-hidden="true"
                  />
                  <Input
                    ref={urlInputRef}
                    id="mode-open-url-url"
                    type="text"
                    inputMode="url"
                    autoFocus
                    value={url}
                    placeholder="https://open.spotify.com/playlist/..."
                    aria-invalid={urlValidationError !== null}
                    disabled={isActionLocked}
                    className="h-9 rounded-[6px] border-surface-border bg-surface-field pl-9 text-sm text-foreground shadow-none placeholder:text-white/24 focus-visible:border-ring focus-visible:ring-ring/35"
                    onBlur={handleUrlBlur}
                    onChange={(event) => {
                      setUrl(event.currentTarget.value);
                      setUrlValidationError(null);
                    }}
                  />
                </div>
                {urlValidationError ? (
                  <div className="mt-1.5 text-xs font-medium text-destructive/80">
                    {urlValidationError}
                  </div>
                ) : null}
              </div>
            </RowField>

            <RowField
              description="Use a short name instead of showing the domain."
              htmlFor="mode-open-url-label"
              label="Label"
            >
              <div className="relative w-full">
                <Tag
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/28"
                  aria-hidden="true"
                />
                <Input
                  id="mode-open-url-label"
                  value={label}
                  placeholder="Focus playlist"
                  disabled={isActionLocked}
                  className="h-9 rounded-[6px] border-surface-border bg-surface-field pl-9 text-sm text-foreground shadow-none placeholder:text-white/24 focus-visible:border-ring focus-visible:ring-ring/35"
                  onChange={(event) => {
                    setLabel(event.currentTarget.value);
                  }}
                />
              </div>
            </RowField>

            <OpenAppRepeatRow
              disabled={isActionLocked}
              repeatPolicy={repeatPolicy}
              onRepeatPolicyChange={setRepeatPolicy}
            />

            <OpenAppToggleRow
              description="Turn this action on or off."
              disabled={isActionLocked}
              icon={<Power className="size-3.5" aria-hidden="true" />}
              isActive={enabled}
              label="Enabled"
              onCheckedChange={setEnabled}
            />
          </SettingsPanel>
        </div>

        <div className="flex flex-col gap-3 border-t border-surface-border px-5 py-3 shadow-[0_-1px_0_rgba(255,255,255,0.025)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            {onDeleteAction ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start rounded-[6px] px-2.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/25 disabled:opacity-35 dark:hover:bg-destructive/10 dark:hover:text-destructive"
                disabled={isDeletingAction || isSavingAction}
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete action
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-[6px] border border-surface-border bg-white/[0.035] px-3 text-white/62 hover:border-surface-border-strong hover:bg-white/[0.06] hover:text-foreground"
              disabled={isSavingAction || isDeletingAction}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="rounded-[6px] px-3 disabled:opacity-35"
              disabled={!canSaveAction}
            >
              {isSavingAction ? 'Saving...' : isEditing ? 'Save action' : 'Create action'}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialogContent
        className="rounded-[8px] border-surface-border-strong bg-card text-foreground"
        size="sm"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this action?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will be removed from the mode. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingAction}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeletingAction}
            onClick={(event) => {
              void handleConfirmDelete(event);
            }}
          >
            {isDeletingAction ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getOpenUrlValidationError(value: string) {
  if (value.trim() === '' || normalizeOpenUrl(value) !== null) {
    return null;
  }

  return 'Enter a valid http/https URL or Spotify link.';
}
