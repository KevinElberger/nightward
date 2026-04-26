import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ArrowLeft, Check, FolderOpen, Power, Settings2, Trash2, X } from 'lucide-react';
import type {
  ModeActionPhase,
  ModeActionSet,
  OpenAppModeAction,
  OpenAppModeActionInput
} from '@shared/modes';
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
import { SectionButton, SettingsPanel } from './mode-action-editor-layout';
import { OpenAppAdvancedSection } from './open-app-advanced-section';
import { OpenAppApplicationRow } from './open-app-application-row';
import { OpenAppRepeatRow } from './open-app-repeat-row';
import { OpenAppToggleRow } from './open-app-toggle-row';
import { findMatchingOpenAppAction, getApplicationNameFromPath } from './open-app-action-utils';

type OpenAppEditorSection = 'application' | 'advanced';

type ModeOpenAppActionEditorProps = {
  action: OpenAppModeAction | null;
  isDeletingAction: boolean;
  isSavingAction: boolean;
  modeActions: ModeActionSet;
  onBack?: () => void;
  onClose: () => void;
  onDeleteAction?: () => Promise<void>;
  onSaveAction: (action: OpenAppModeActionInput) => Promise<void>;
  phase: ModeActionPhase;
};

export function ModeOpenAppActionEditor({
  action,
  isDeletingAction,
  isSavingAction,
  modeActions,
  onBack,
  onClose,
  onDeleteAction,
  onSaveAction,
  phase
}: ModeOpenAppActionEditorProps) {
  const [appName, setAppName] = useState(() => action?.appName ?? '');
  const [appPath, setAppPath] = useState(() => action?.appPath ?? '');
  const [bundleId, setBundleId] = useState(() => action?.bundleId ?? '');
  const [enabled, setEnabled] = useState(() => action?.enabled ?? true);
  const [appIconDataUrl, setAppIconDataUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<OpenAppEditorSection>('application');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelectingApplication, setIsSelectingApplication] = useState(false);
  const [applicationSelectionError, setApplicationSelectionError] = useState<string | null>(null);
  const [onlyOpenIfNotRunning, setOnlyOpenIfNotRunning] = useState(
    () => action?.onlyOpenIfNotRunning ?? true
  );
  const [repeatPolicy, setRepeatPolicy] = useState<OpenAppModeActionInput['repeatPolicy']>(
    () => action?.repeatPolicy ?? 'every-activation'
  );

  const normalizedAppPath = appPath.trim();
  const normalizedAppName = appName.trim() || getApplicationNameFromPath(normalizedAppPath);
  const normalizedBundleId = bundleId.trim();
  const isEditing = action !== null;
  const hasSelectedApplication = normalizedAppPath !== '';
  const samePhaseDuplicate = hasSelectedApplication
    ? findMatchingOpenAppAction(
        modeActions[phase],
        normalizedAppPath,
        normalizedBundleId,
        action?.id
      )
    : null;
  const oppositePhase = phase === 'enter' ? 'exit' : 'enter';
  const oppositePhaseDuplicate = hasSelectedApplication
    ? findMatchingOpenAppAction(modeActions[oppositePhase], normalizedAppPath, normalizedBundleId)
    : null;
  const duplicateApplicationError =
    samePhaseDuplicate !== null
      ? `This app already opens when the mode ${phase === 'enter' ? 'starts' : 'ends'}. Edit that action instead.`
      : null;
  const duplicateApplicationWarning =
    duplicateApplicationError === null && oppositePhaseDuplicate !== null
      ? `This app also opens when the mode ${oppositePhase === 'enter' ? 'starts' : 'ends'}.`
      : null;
  const canSaveAction =
    !isSavingAction &&
    !isDeletingAction &&
    normalizedAppName !== '' &&
    normalizedAppPath !== '' &&
    duplicateApplicationError === null;
  const isActionLocked = isSavingAction || isDeletingAction;
  const description = useMemo(
    () =>
      phase === 'enter'
        ? 'Launch this app when the mode starts.'
        : 'Launch this app when the mode ends.',
    [phase]
  );

  useEffect(() => {
    if (action?.appPath === undefined) {
      return;
    }

    let isCurrent = true;

    void window.nightward.applications
      .getIcon(action.appPath)
      .then((iconDataUrl) => {
        if (isCurrent) {
          setAppIconDataUrl(iconDataUrl);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setAppIconDataUrl(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [action?.appPath]);

  const handleSave = async () => {
    if (!canSaveAction) {
      return;
    }

    await onSaveAction({
      appName: normalizedAppName,
      appPath: normalizedAppPath,
      ...(normalizedBundleId === '' ? {} : { bundleId: normalizedBundleId }),
      enabled,
      onlyOpenIfNotRunning,
      repeatPolicy,
      type: 'open-app'
    });
  };

  const handleSelectApplication = async () => {
    if (isSavingAction || isDeletingAction || isSelectingApplication) {
      return;
    }

    setApplicationSelectionError(null);
    setIsSelectingApplication(true);

    try {
      const selectedApplication = await window.nightward.applications.select();

      if (selectedApplication !== null) {
        setAppName(
          selectedApplication.appName.trim() ||
            getApplicationNameFromPath(selectedApplication.appPath)
        );
        setAppPath(selectedApplication.appPath);
        setAppIconDataUrl(selectedApplication.iconDataUrl);
      }
    } catch {
      setApplicationSelectionError('Unable to choose an app. Please try again.');
    } finally {
      setIsSelectingApplication(false);
    }
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
        <div className="border-b border-surface-border bg-surface-panel-muted px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {onBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-[4px] border border-surface-border bg-surface-control text-white/58 hover:bg-surface-hover hover:text-foreground"
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
              className="rounded-[4px] border border-surface-border bg-surface-control text-white/56 hover:bg-surface-hover hover:text-foreground"
              aria-label="Close action composer"
              onClick={onClose}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-normal text-foreground">
            Open an app
          </h3>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/42">{description}</p>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-surface-panel-muted sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:grid-rows-1">
          <nav
            aria-label="Open app settings"
            className="border-b border-surface-border bg-surface-panel-muted p-3 sm:border-r sm:border-b-0"
          >
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
              <SectionButton
                icon={<FolderOpen className="size-3.5" aria-hidden="true" />}
                isActive={activeSection === 'application'}
                label="Application"
                onClick={() => {
                  setActiveSection('application');
                }}
              />
              <SectionButton
                icon={<Settings2 className="size-3.5" aria-hidden="true" />}
                isActive={activeSection === 'advanced'}
                label="Advanced"
                onClick={() => {
                  setActiveSection('advanced');
                }}
              />
            </div>
          </nav>

          <div className="min-h-0 overflow-y-auto p-4">
            {activeSection === 'application' ? (
              <SettingsPanel>
                <OpenAppApplicationRow
                  appIconDataUrl={appIconDataUrl}
                  appName={appName}
                  applicationSelectionError={applicationSelectionError}
                  duplicateApplicationError={duplicateApplicationError}
                  duplicateApplicationWarning={duplicateApplicationWarning}
                  hasSelectedApplication={hasSelectedApplication}
                  isDisabled={isActionLocked}
                  isSelectingApplication={isSelectingApplication}
                  onIconError={() => {
                    setAppIconDataUrl(null);
                  }}
                  onSelectApplication={() => {
                    void handleSelectApplication();
                  }}
                />

                <OpenAppRepeatRow
                  disabled={isActionLocked}
                  repeatPolicy={repeatPolicy}
                  onRepeatPolicyChange={setRepeatPolicy}
                />

                <OpenAppToggleRow
                  description="Skip launching if the app is already running."
                  disabled={isActionLocked}
                  icon={<Check className="size-3.5" aria-hidden="true" />}
                  isActive={onlyOpenIfNotRunning}
                  label="Only if closed"
                  onCheckedChange={setOnlyOpenIfNotRunning}
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
            ) : (
              <OpenAppAdvancedSection
                bundleId={bundleId}
                disabled={isActionLocked}
                onBundleIdChange={setBundleId}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-surface-border bg-surface-panel-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {onDeleteAction ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start rounded-[4px] px-2.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/25 disabled:opacity-35 dark:hover:bg-destructive/10 dark:hover:text-destructive"
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
              className="rounded-[4px] border border-surface-border bg-surface-control px-3 text-white/58 hover:bg-surface-hover hover:text-foreground"
              disabled={isSavingAction || isDeletingAction}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="rounded-[4px] px-3 disabled:opacity-35"
              disabled={!canSaveAction}
            >
              {isSavingAction ? 'Saving…' : isEditing ? 'Save action' : 'Create action'}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialogContent
        className="rounded-[8px] border-white/[0.085] bg-[#09090a] text-foreground shadow-[0_18px_54px_rgba(0,0,0,0.55)]"
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
