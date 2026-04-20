// @vitest-environment happy-dom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearApiMock, installApiMock } from '../test/api-test-utils';
import { useModes } from './use-modes';

describe('useModes', () => {
  afterEach(() => {
    cleanup();
    clearApiMock();
    vi.restoreAllMocks();
  });

  it('loads modes from the preload bridge on mount', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const list = vi.fn().mockResolvedValue(modes);
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.modes).toEqual(modes);
    expect(list).toHaveBeenCalledOnce();
  });

  it('stores an error message and clears modes when loading fails', async () => {
    const list = vi.fn().mockRejectedValue(new Error('Bridge unavailable'));
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Bridge unavailable');
    expect(result.current.modes).toEqual([]);
  });

  it('uses a fallback error message for non-error failures', async () => {
    const list = vi.fn().mockRejectedValue('nope');
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.error).toBe('Unable to load modes.'));
  });

  it('refreshes modes on demand', async () => {
    const firstModes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const nextModes = [
      ...firstModes,
      {
        id: 'mode-2',
        name: 'Deep Work'
      }
    ];
    const list = vi.fn().mockResolvedValueOnce(firstModes).mockResolvedValueOnce(nextModes);
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    await act(async () => {
      await result.current.refreshModes();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(list).toHaveBeenCalledTimes(2);
  });
});
