// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildModeActionSet,
  buildOpenAppModeAction,
  buildOpenAppModeActionInput,
  buildSavedMode
} from '@test/builders/shared/modes';
import { AppSelectionContext } from '../app-shell/app-selection-context';
import { clearApiMock, installApiMock } from '../../test/api-test-utils';
import { ModesContext } from './modes-context';
import { ModeDetailPage } from './mode-detail-page';
import type { ModesState } from './hooks/use-modes';

const renderModeDetailPage = (mode = buildSavedMode(), overrides: Partial<ModesState> = {}) => {
  if (!('nightward' in window)) {
    installApiMock();
  }

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
    updateModeAction: vi.fn().mockResolvedValue(mode),
    ...overrides
  };

  render(
    <ModesContext.Provider value={modesState}>
      <AppSelectionContext.Provider value={{ selectMode: vi.fn(), selectedModeId: mode.id }}>
        <ModeDetailPage />
      </AppSelectionContext.Provider>
    </ModesContext.Provider>
  );

  return { modesState };
};

describe('ModeDetailPage', () => {
  afterEach(() => {
    cleanup();
    clearApiMock();
    vi.restoreAllMocks();
  });

  it('renders empty start and end action sections', () => {
    renderModeDetailPage();

    expect(screen.getByRole('heading', { name: /when mode starts/i })).not.toBeNull();
    expect(screen.getByRole('heading', { name: /when mode ends/i })).not.toBeNull();
    expect(screen.getByText('Start this mode with momentum')).not.toBeNull();
    expect(screen.getByText('End this mode with intention')).not.toBeNull();
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
    expect(screen.getByText('Once per day')).not.toBeNull();
    expect(screen.getByText('Skips if already running')).not.toBeNull();
    expect(screen.getByText('Enabled')).not.toBeNull();
    expect(screen.queryByText('No start actions')).toBeNull();
  });

  it('hydrates open app icons in the action list', async () => {
    const getIcon = vi.fn().mockResolvedValue('data:image/png;base64,discord');
    installApiMock({ applications: { getIcon } });
    renderModeDetailPage(
      buildSavedMode({
        actions: buildModeActionSet({
          enter: [
            buildOpenAppModeAction({
              appName: 'Discord',
              appPath: '/Applications/Discord.app'
            })
          ]
        })
      })
    );

    await waitFor(() => expect(getIcon).toHaveBeenCalledWith('/Applications/Discord.app'));

    expect(document.querySelector('img[src="data:image/png;base64,discord"]')).not.toBeNull();
  });

  it('surfaces warning when the same app is configured in both phases', () => {
    renderModeDetailPage(
      buildSavedMode({
        actions: buildModeActionSet({
          enter: [buildOpenAppModeAction({ id: 'start-action' })],
          exit: [buildOpenAppModeAction({ id: 'end-action' })]
        })
      })
    );

    expect(screen.getByText('Also opens when mode ends')).not.toBeNull();
    expect(screen.getByText('Also opens when mode starts')).not.toBeNull();
  });

  it('creates a start action from the composer overlay', async () => {
    const createdMode = buildSavedMode();
    const createModeAction = vi.fn().mockResolvedValue(createdMode);
    installApiMock({
      applications: {
        select: vi.fn().mockResolvedValue({
          appName: 'Spotify',
          appPath: '/Applications/Spotify.app',
          iconDataUrl: null
        })
      }
    });
    renderModeDetailPage(buildSavedMode(), { createModeAction });

    fireEvent.click(screen.getByRole('button', { name: /add your first start action/i }));
    fireEvent.click(screen.getByRole('button', { name: /open app/i }));
    fireEvent.click(screen.getByRole('button', { name: /^choose$/i }));

    await waitFor(() => expect(screen.getByText('Spotify')).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    fireEvent.change(screen.getByLabelText('Bundle ID'), {
      target: { value: 'com.spotify.client' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create action/i }));

    await waitFor(() =>
      expect(createModeAction).toHaveBeenCalledWith(
        'mode-1',
        'enter',
        buildOpenAppModeActionInput({
          appName: 'Spotify',
          appPath: '/Applications/Spotify.app',
          bundleId: 'com.spotify.client'
        })
      )
    );

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /create action/i })).toBeNull()
    );
  });

  it('selects an application from the native picker', async () => {
    const select = vi.fn().mockResolvedValue({
      appName: 'Spotify',
      appPath: '/Applications/Spotify.app',
      iconDataUrl: 'data:image/png;base64,abc'
    });
    installApiMock({ applications: { select } });
    renderModeDetailPage();

    fireEvent.click(screen.getByRole('button', { name: /add your first start action/i }));
    fireEvent.click(screen.getByRole('button', { name: /open app/i }));
    fireEvent.click(screen.getByRole('button', { name: /^choose$/i }));

    await waitFor(() => expect(select).toHaveBeenCalledOnce());

    expect(screen.queryByLabelText('Display name')).toBeNull();
    expect(screen.getByText('Spotify')).not.toBeNull();
    expect(screen.queryByText('Ready to open when this action runs.')).toBeNull();
    expect(screen.getByRole('button', { name: /^change$/i })).not.toBeNull();
    expect(document.querySelector('img[src="data:image/png;base64,abc"]')).not.toBeNull();
  });

  it('warns before saving an app that already opens in the opposite phase', async () => {
    installApiMock({
      applications: {
        select: vi.fn().mockResolvedValue({
          appName: 'Calendar',
          appPath: '/Applications/Calendar.app',
          iconDataUrl: null
        })
      }
    });
    renderModeDetailPage(
      buildSavedMode({
        actions: buildModeActionSet({
          exit: [buildOpenAppModeAction()]
        })
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /add your first start action/i }));
    fireEvent.click(screen.getByRole('button', { name: /open app/i }));
    fireEvent.click(screen.getByRole('button', { name: /^choose$/i }));

    await waitFor(() =>
      expect(screen.getByText('This app also opens when the mode ends.')).not.toBeNull()
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: /create action/i }).disabled).toBe(
      false
    );
  });

  it('blocks saving a duplicate app in the same phase', async () => {
    installApiMock({
      applications: {
        select: vi.fn().mockResolvedValue({
          appName: 'Calendar',
          appPath: '/Applications/Calendar.app',
          iconDataUrl: null
        })
      }
    });
    renderModeDetailPage(
      buildSavedMode({
        actions: buildModeActionSet({
          enter: [buildOpenAppModeAction()]
        })
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /add start action/i }));
    fireEvent.click(screen.getByRole('button', { name: /open app/i }));
    fireEvent.click(screen.getByRole('button', { name: /^choose$/i }));

    await waitFor(() =>
      expect(
        screen.getByText('This app already opens when the mode starts. Edit that action instead.')
      ).not.toBeNull()
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: /create action/i }).disabled).toBe(
      true
    );
  });

  it('edits an existing action in the composer overlay', async () => {
    const mode = buildSavedMode({
      actions: buildModeActionSet({
        enter: [buildOpenAppModeAction()]
      })
    });
    const updateModeAction = vi.fn().mockResolvedValue(mode);
    installApiMock({
      applications: {
        getIcon: vi.fn().mockResolvedValue('data:image/png;base64,calendar')
      }
    });
    renderModeDetailPage(mode, { updateModeAction });

    fireEvent.click(screen.getByRole('button', { name: /edit open app action for calendar/i }));
    fireEvent.click(screen.getByRole('button', { name: /once per day/i }));
    fireEvent.click(screen.getByRole('button', { name: /save action/i }));

    await waitFor(() =>
      expect(updateModeAction).toHaveBeenCalledWith(
        'mode-1',
        'enter',
        'action-1',
        buildOpenAppModeActionInput({ repeatPolicy: 'once-per-day' })
      )
    );
  });

  it('confirms before deleting an existing action', async () => {
    const mode = buildSavedMode({
      actions: buildModeActionSet({
        enter: [buildOpenAppModeAction()]
      })
    });
    const deleteModeAction = vi.fn().mockResolvedValue(mode);
    installApiMock({
      applications: {
        getIcon: vi.fn().mockResolvedValue(null)
      }
    });
    renderModeDetailPage(mode, { deleteModeAction });

    fireEvent.click(screen.getByRole('button', { name: /edit open app action for calendar/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete action/i }));

    expect(screen.getByText('Delete this action?')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() =>
      expect(deleteModeAction).toHaveBeenCalledWith('mode-1', 'enter', 'action-1')
    );
  });
});
