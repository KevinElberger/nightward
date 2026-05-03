import { Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModeLibraryEmptyStateProps = {
  isCreating: boolean;
  onCreateMode: () => void;
};

export function ModeLibraryEmptyState({ isCreating, onCreateMode }: ModeLibraryEmptyStateProps) {
  return (
    <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex size-11 items-center justify-center rounded-[7px] border border-surface-border bg-white/[0.04] text-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">
          No modes yet
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/46">
          Modes tell Nightward how your Mac should behave for a specific kind of work.
        </p>
        <Button
          type="button"
          size="xs"
          disabled={isCreating}
          className="mt-5 h-8 rounded-[6px] px-3"
          onClick={onCreateMode}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Create mode
        </Button>
      </div>
    </div>
  );
}
