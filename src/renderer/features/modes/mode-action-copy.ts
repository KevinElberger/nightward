import type { ModeActionFailure } from '@shared/mode-automation';

export const getModeActionFailureToastTitle = (failure: ModeActionFailure) => {
  switch (failure.actionType) {
    case 'open-app':
      return `Couldn't open ${failure.appName ?? 'app'}.`;

    case 'open-url':
      return "Couldn't open URL.";
  }
};
