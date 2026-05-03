import type { ReactNode, Ref } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODE_NAME_MAX_LENGTH } from '../../../../shared/modes';
import { useModeRename } from '../hooks/use-mode-rename';

type ModeRenameControlRenderProps = {
  startRenaming: () => void;
  triggerButtonClassName: string;
  triggerButtonSize: ModeRenameButtonSize;
};

type ModeRenameControlProps = {
  children: (props: ModeRenameControlRenderProps) => ReactNode;
  leadingContent?: ReactNode;
  modeId: string;
  name: string;
  onRenameMode: (id: string, name: string) => Promise<unknown>;
  variant: ModeRenameControlVariant;
};

type ModeRenameControlVariant = 'title' | 'row';
type ModeRenameButtonSize = 'icon-xs' | 'icon-sm';

type ModeRenameVariantConfig = {
  actionsClassName: string;
  buttonClassName: string;
  buttonSize: ModeRenameButtonSize;
  formClassName: string;
  getInputAriaLabel: (name: string) => string;
  inputClassName: string;
  triggerButtonClassName: string;
  triggerButtonSize: ModeRenameButtonSize;
};

type ModeRenameFormProps = {
  actionsClassName: string;
  buttonClassName: string;
  buttonSize: ModeRenameButtonSize;
  canSaveName: boolean;
  className: string;
  inputAriaLabel: string;
  inputClassName: string;
  inputRef: Ref<HTMLInputElement>;
  isSavingName: boolean;
  leadingContent?: ReactNode;
  onCancel: () => void;
  onDraftNameChange: (name: string) => void;
  onSave: () => Promise<void> | void;
  value: string;
};

const titleActionButtonClassName =
  'rounded-[6px] border border-transparent bg-transparent text-white/42 transition-[background-color,border-color,color,opacity] hover:border-surface-border hover:bg-surface-control hover:text-white/82 focus-visible:ring-ring/35 disabled:opacity-30';

const modeRenameVariants = {
  title: {
    actionsClassName: 'flex -translate-y-0.5 items-center gap-1.5 self-center',
    buttonClassName: titleActionButtonClassName,
    buttonSize: 'icon-xs',
    formClassName: 'flex h-[3.1rem] min-w-0 items-center gap-2.5',
    getInputAriaLabel: () => 'Mode name',
    inputClassName:
      'h-[3.1rem] w-[min(42rem,72vw)] max-w-full min-w-[10rem] rounded-none border-x-0 border-t-0 border-b border-white/[0.2] bg-transparent px-0 py-0 font-heading text-[2.45rem] font-semibold leading-[1.05] tracking-normal text-foreground shadow-none outline-none transition-[border-color,color] hover:border-white/30 focus:border-white/38 focus:ring-0 focus-visible:border-white/38 focus-visible:ring-0 disabled:bg-transparent disabled:opacity-60 dark:border-white/[0.2] dark:bg-transparent dark:hover:border-white/30 dark:focus:border-white/38 dark:focus-visible:border-white/38 md:text-[2.45rem]',
    triggerButtonClassName: titleActionButtonClassName,
    triggerButtonSize: 'icon-xs'
  },
  row: {
    actionsClassName: 'flex items-center gap-1.5',
    buttonClassName:
      'size-8 rounded-[6px] border border-surface-border bg-surface-control text-white/58 hover:border-surface-border-strong hover:bg-surface-hover hover:text-foreground disabled:opacity-35',
    buttonSize: 'icon-sm',
    formClassName:
      'app-no-drag col-span-full grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3',
    getInputAriaLabel: (name) => `Mode name for ${name}`,
    inputClassName:
      'h-8 rounded-[6px] border-surface-border bg-surface-field px-2 text-sm font-medium text-foreground shadow-none focus-visible:border-ring focus-visible:ring-ring/35',
    triggerButtonClassName:
      'size-8 rounded-[6px] border border-surface-border bg-surface-control text-white/58 hover:border-surface-border-strong hover:bg-surface-hover hover:text-foreground disabled:opacity-35',
    triggerButtonSize: 'icon-sm'
  }
} satisfies Record<ModeRenameControlVariant, ModeRenameVariantConfig>;

export function ModeRenameControl({
  children,
  leadingContent,
  modeId,
  name,
  onRenameMode,
  variant
}: ModeRenameControlProps) {
  const variantConfig = modeRenameVariants[variant];
  const {
    canSaveName,
    cancelRenaming,
    draftName,
    isRenaming,
    isSavingName,
    renameInputRef,
    saveName,
    setDraftName,
    startRenaming
  } = useModeRename({ modeId, name, onRenameMode });

  if (!isRenaming) {
    return children({
      startRenaming,
      triggerButtonClassName: variantConfig.triggerButtonClassName,
      triggerButtonSize: variantConfig.triggerButtonSize
    });
  }

  return (
    <ModeRenameForm
      actionsClassName={variantConfig.actionsClassName}
      buttonClassName={variantConfig.buttonClassName}
      buttonSize={variantConfig.buttonSize}
      canSaveName={canSaveName}
      className={variantConfig.formClassName}
      inputAriaLabel={variantConfig.getInputAriaLabel(name)}
      inputClassName={variantConfig.inputClassName}
      inputRef={renameInputRef}
      isSavingName={isSavingName}
      leadingContent={leadingContent}
      onCancel={cancelRenaming}
      onDraftNameChange={setDraftName}
      onSave={saveName}
      value={draftName}
    />
  );
}

function ModeRenameForm({
  actionsClassName,
  buttonClassName,
  buttonSize,
  canSaveName,
  className,
  inputAriaLabel,
  inputClassName,
  inputRef,
  isSavingName,
  leadingContent,
  onCancel,
  onDraftNameChange,
  onSave,
  value
}: ModeRenameFormProps) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        void onSave();
      }}
    >
      {leadingContent}
      <Input
        ref={inputRef}
        value={value}
        aria-label={inputAriaLabel}
        maxLength={MODE_NAME_MAX_LENGTH}
        className={inputClassName}
        disabled={isSavingName}
        onChange={(event) => {
          onDraftNameChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <div className={actionsClassName}>
        <Button
          type="submit"
          variant="ghost"
          size={buttonSize}
          className={buttonClassName}
          disabled={!canSaveName}
          aria-label="Save mode name"
        >
          <Check className="size-3" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size={buttonSize}
          className={buttonClassName}
          disabled={isSavingName}
          aria-label="Cancel renaming mode"
          onClick={onCancel}
        >
          <X className="size-3" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
