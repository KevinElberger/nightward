import { Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModeLibraryEmptyStateProps = {
  isCreating: boolean;
  onCreateMode: () => void;
};

export function ModeLibraryEmptyState({ isCreating, onCreateMode }: ModeLibraryEmptyStateProps) {
  return (
    <div className="flex min-h-44 items-center justify-center px-6 py-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex size-10 items-center justify-center rounded-[4px] border border-white/[0.07] bg-white/[0.055] text-white/50">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">
          No modes yet
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/42">
          Modes tell Nightward how your Mac should behave for a specific kind of work.
        </p>
        <Button
          type="button"
          size="xs"
          disabled={isCreating}
          className="mt-5 h-8 rounded-[4px] bg-primary px-2.5 text-primary-foreground hover:bg-primary/90"
          onClick={onCreateMode}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Create mode
        </Button>
      </div>
    </div>
  );
}
