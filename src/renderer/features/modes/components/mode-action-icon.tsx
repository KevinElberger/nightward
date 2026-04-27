import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ModeAction } from '@shared/modes';

type ModeActionIconProps = {
  action: ModeAction;
  FallbackIcon: LucideIcon;
};

const appIconCache = new Map<string, string | null>();
const appIconRequests = new Map<string, Promise<string | null>>();

export function ModeActionIcon({ action, FallbackIcon }: ModeActionIconProps) {
  const appIconDataUrl = useAppIconDataUrl(action.type === 'open-app' ? action.appPath : null);
  const [failedIconDataUrl, setFailedIconDataUrl] = useState<string | null>(null);

  if (appIconDataUrl !== null && appIconDataUrl !== failedIconDataUrl) {
    return (
      <img
        src={appIconDataUrl}
        alt=""
        className="size-5 rounded-[4px] object-contain"
        draggable={false}
        onError={() => {
          setFailedIconDataUrl(appIconDataUrl);
        }}
      />
    );
  }

  return <FallbackIcon className="size-4" aria-hidden="true" />;
}

function useAppIconDataUrl(appPath: string | null) {
  const [loadedIcon, setLoadedIcon] = useState<{
    appPath: string;
    iconDataUrl: string | null;
  } | null>(null);

  useEffect(() => {
    if (appPath === null || appIconCache.has(appPath)) {
      return;
    }

    let isCurrent = true;

    void loadAppIcon(appPath).then((iconDataUrl) => {
      if (isCurrent) {
        setLoadedIcon({ appPath, iconDataUrl });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [appPath]);

  if (appPath === null) {
    return null;
  }

  if (appIconCache.has(appPath)) {
    return appIconCache.get(appPath) ?? null;
  }

  return loadedIcon?.appPath === appPath ? loadedIcon.iconDataUrl : null;
}

function loadAppIcon(appPath: string) {
  const cachedIcon = appIconRequests.get(appPath);

  if (cachedIcon !== undefined) {
    return cachedIcon;
  }

  const iconRequest = window.nightward.applications
    .getIcon(appPath)
    .catch(() => null)
    .then((iconDataUrl) => {
      appIconCache.set(appPath, iconDataUrl);
      appIconRequests.delete(appPath);

      return iconDataUrl;
    });

  appIconRequests.set(appPath, iconRequest);

  return iconRequest;
}
