// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildModeActionSet,
  buildOpenAppModeAction,
  buildSavedMode
} from '@test/builders/shared/modes';
import { AppSelectionContext } from '../app-shell/app-selection-context';
import { ModesContext } from './modes-context';
import { ModeDetailPage } from './mode-detail-page';
import type { ModesState } from './hooks/use-modes';

const renderModeDetailPage = (mode = buildSavedMode()) => {
  const modesState: ModesState = {
    activateMode: vi.fn().mockResolvedValue(true),
    activeModeId: null,
    createModeAction: vi.fn().mockResolvedValue(mode),
    createMode: vi.fn().mockResolvedValue(null),
    deactivateMode: vi.fn().mockResolvedValue(true),
    deleteModeAction: vi.fn().mockResolvedValue(mode),
    deleteMode: vi.fn().mockResolvedValue(true),
    error: null,
    isLoading: false,
    modes: [mode],
    refreshModes: vi.fn().mockResolvedValue(undefined),
    renameMode: vi.fn().mockResolvedValue(mode),
    setModePinned: vi.fn().mockResolvedValue(mode),
    updateModeAction: vi.fn().mockResolvedValue(mode)
  };

  render(
    <ModesContext.Provider value={modesState}>
      <AppSelectionContext.Provider value={{ selectMode: vi.fn(), selectedModeId: mode.id }}>
        <ModeDetailPage />
      </AppSelectionContext.Provider>
    </ModesContext.Provider>
  );
};

describe('ModeDetailPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders empty start and end action sections', () => {
    renderModeDetailPage();

    expect(screen.getByRole('heading', { name: /when mode starts/i })).not.toBeNull();
    expect(screen.getByRole('heading', { name: /when mode ends/i })).not.toBeNull();
    expect(screen.getByText('No start actions')).not.toBeNull();
    expect(screen.getByText('No end actions')).not.toBeNull();
    expect(screen.getAllByText('0 actions')).toHaveLength(2);
    expect(screen.getByText('Manual activation')).not.toBeNull();
  });

  it('renders configured open app actions', () => {
    renderModeDetailPage(
      buildSavedMode({
        actions: buildModeActionSet({
          enter: [
            buildOpenAppModeAction({
              onlyOpenIfNotRunning: true,
              repeatPolicy: 'once-per-day'
            })
          ]
        })
      })
    );

    expect(screen.getByText('1 action')).not.toBeNull();
    expect(screen.getByText('Calendar')).not.toBeNull();
    expect(screen.getByText('Open app')).not.toBeNull();
    expect(screen.getByText('Once per day')).not.toBeNull();
    expect(screen.getByText('Only if closed')).not.toBeNull();
    expect(screen.getByText('Enabled')).not.toBeNull();
    expect(screen.queryByText('No start actions')).toBeNull();
  });
});
