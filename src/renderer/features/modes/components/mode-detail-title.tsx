import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODE_NAME_MAX_LENGTH } from '../../../../shared/modes';

type ModeDetailTitleProps = {
  modeId: string;
  name: string;
  onRenameMode: (id: string, name: string) => Promise<unknown>;
};

export type ModeDetailTitleHandle = {
  startRenaming: () => void;
};

const titleActionButtonClassName =
  'inline-flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.095] bg-white/[0.065] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] outline-none transition-[background-color,border-color,color,opacity] hover:border-white/[0.14] hover:bg-white/[0.105] hover:text-white/90 focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-35';

export const ModeDetailTitle = forwardRef<ModeDetailTitleHandle, ModeDetailTitleProps>(
  function ModeDetailTitle({ modeId, name, onRenameMode }, ref) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const startRenaming = useCallback(() => {
      setDraftName(name);
      setIsRenaming(true);
    }, [name]);

    useImperativeHandle(
      ref,
      () => ({
        startRenaming
      }),
      [startRenaming]
    );

    useEffect(() => {
      if (!isRenaming) {
        return;
      }

      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, [isRenaming]);

    const normalizedDraftName = draftName.trim();
    const canSaveName = !isSavingName && normalizedDraftName !== '';

    const cancelRenaming = () => {
      setDraftName(name);
      setIsRenaming(false);
    };

    const saveName = async () => {
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
    };

    if (isRenaming) {
      return (
        <form
          className="flex min-w-0 items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void saveName();
          }}
        >
          <input
            ref={renameInputRef}
            value={draftName}
            aria-label="Mode name"
            maxLength={MODE_NAME_MAX_LENGTH}
            className="h-9 w-[min(34rem,72vw)] max-w-full min-w-0 rounded-[4px] border border-white/[0.085] bg-white/[0.035] px-2 text-2xl font-semibold tracking-normal text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary/45 focus:ring-[3px] focus:ring-primary/16"
            disabled={isSavingName}
            onChange={(event) => {
              setDraftName(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                cancelRenaming();
              }
            }}
          />
          <button
            type="submit"
            disabled={!canSaveName}
            className={titleActionButtonClassName}
            aria-label="Save mode name"
          >
            <Check className="size-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={isSavingName}
            className={titleActionButtonClassName}
            aria-label="Cancel renaming mode"
            onClick={cancelRenaming}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </form>
      );
    }

    return (
      <button
        type="button"
        className="group/title flex min-w-0 items-center gap-2 text-left outline-none"
        onClick={startRenaming}
      >
        <h2 className="truncate text-2xl font-semibold tracking-normal text-foreground">{name}</h2>
        <span
          className={cn(
            titleActionButtonClassName,
            'group-hover/title:border-white/[0.14] group-hover/title:bg-white/[0.105] group-hover/title:text-white/90'
          )}
        >
          <Pencil className="size-3" aria-hidden="true" />
        </span>
        <span className="sr-only">Rename mode</span>
      </button>
    );
  }
);
