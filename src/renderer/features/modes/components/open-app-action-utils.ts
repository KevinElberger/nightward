import type { ModeAction } from '@shared/modes';

export function findMatchingOpenAppAction(
  actions: ModeAction[],
  appPath: string,
  bundleId: string,
  ignoredActionId?: string
) {
  return (
    actions.find((action) => {
      if (action.id === ignoredActionId) {
        return false;
      }

      return isMatchingOpenAppSelection(action, appPath, bundleId);
    }) ?? null
  );
}

export function getApplicationNameFromPath(appPath: string) {
  const fileName = appPath.split(/[/\\]/).filter(Boolean).pop() ?? '';

  return fileName.replace(/\.app$/i, '').trim();
}

function isMatchingOpenAppSelection(action: ModeAction, appPath: string, bundleId: string) {
  const normalizedBundleId = normalizeComparableValue(bundleId);
  const actionBundleId = normalizeComparableValue(action.bundleId ?? '');

  if (normalizedBundleId !== '' && actionBundleId !== '') {
    return normalizedBundleId === actionBundleId;
  }

  return normalizeComparableValue(action.appPath) === normalizeComparableValue(appPath);
}

function normalizeComparableValue(value: string) {
  return value.trim().toLowerCase();
}
