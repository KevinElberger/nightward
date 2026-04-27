import type { ModeAction, ModeActionPhase } from './modes';

export type ModeActionFailure = {
  actionId: string;
  actionType: ModeAction['type'];
  appName: string | null;
  message: string;
  modeId: string;
  modeName: string;
  phase: ModeActionPhase;
};

export type ModeAutomationResult = {
  actionFailures: ModeActionFailure[];
  ok: boolean;
};

export const createModeAutomationResult = (
  ok: boolean,
  actionFailures: ModeActionFailure[] = []
): ModeAutomationResult => ({
  actionFailures,
  ok
});
