import { describe, expect, it, vi } from 'vitest';
import { MODE_IPC_CHANNELS } from '../shared/mode-ipc';
import { createNightwardApi } from './nightward-api';

describe('createNightwardApi', () => {
  it('invokes the list modes channel', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    const api = createNightwardApi({ invoke });

    await expect(api.modes.list()).resolves.toEqual([]);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.list);
  });

  it('invokes the create mode channel with a typed request payload', async () => {
    const createdMode = {
      id: 'mode-1',
      name: 'Focus'
    };
    const invoke = vi.fn().mockResolvedValue(createdMode);
    const api = createNightwardApi({ invoke });

    await expect(api.modes.create('Focus')).resolves.toEqual(createdMode);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.create, {
      name: 'Focus'
    });
  });

  it('invokes the rename mode channel with a typed request payload', async () => {
    const renamedMode = {
      id: 'mode-1',
      name: 'Deep Work'
    };
    const invoke = vi.fn().mockResolvedValue(renamedMode);
    const api = createNightwardApi({ invoke });

    await expect(api.modes.rename('mode-1', 'Deep Work')).resolves.toEqual(renamedMode);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.rename, {
      id: 'mode-1',
      name: 'Deep Work'
    });
  });

  it('invokes the delete mode channel with a typed request payload', async () => {
    const invoke = vi.fn().mockResolvedValue(true);
    const api = createNightwardApi({ invoke });

    await expect(api.modes.delete('mode-1')).resolves.toBe(true);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.delete, {
      id: 'mode-1'
    });
  });

  it('invokes the activate mode channel with a typed request payload', async () => {
    const invoke = vi.fn().mockResolvedValue(true);
    const api = createNightwardApi({ invoke });

    await expect(api.modes.activate('mode-1')).resolves.toBe(true);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.activate, {
      id: 'mode-1'
    });
  });
});
