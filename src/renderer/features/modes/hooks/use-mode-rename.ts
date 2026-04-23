import { useCallback, useEffect, useRef, useState } from 'react';

type UseModeRenameOptions = {
  modeId: string;
  name: string;
  onRenameMode: (id: string, name: string) => Promise<unknown>;
};

export function useModeRename({ modeId, name, onRenameMode }: UseModeRenameOptions) {
  const [draftName, setDraftName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const normalizedDraftName = draftName.trim();
  const canSaveName = !isSavingName && normalizedDraftName !== '';

  const focusRenameInput = useCallback(() => {
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, []);

  const startRenaming = useCallback(() => {
    setDraftName(name);
    setIsRenaming(true);
  }, [name]);

  const cancelRenaming = useCallback(() => {
    setDraftName(name);
    setIsRenaming(false);
  }, [name]);

  const saveName = useCallback(async () => {
    if (isSavingName || normalizedDraftName === '') {
      return;
    }

    if (normalizedDraftName === name) {
      setIsRenaming(false);
      return;
    }

    setIsSavingName(true);

    try {
      const renamedMode = await onRenameMode(modeId, normalizedDraftName);

      if (renamedMode !== null) {
        setIsRenaming(false);
      }
    } finally {
      setIsSavingName(false);
    }
  }, [isSavingName, modeId, name, normalizedDraftName, onRenameMode]);

  useEffect(() => {
    if (!isRenaming) {
      return;
    }

    focusRenameInput();

    const animationFrameId = window.requestAnimationFrame(focusRenameInput);
    const timeoutId = window.setTimeout(focusRenameInput, 0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [focusRenameInput, isRenaming]);

  return {
    canSaveName,
    cancelRenaming,
    draftName,
    isRenaming,
    isSavingName,
    renameInputRef,
    saveName,
    setDraftName,
    startRenaming
  };
}
