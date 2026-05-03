import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModeLibrarySearchEmptyStateProps = {
  onClearSearch: () => void;
  query: string;
};

export function ModeLibrarySearchEmptyState({
  onClearSearch,
  query
}: ModeLibrarySearchEmptyStateProps) {
  return (
    <div className="flex min-h-56 items-center justify-center px-6 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex size-11 items-center justify-center rounded-[7px] border border-white/[0.08] bg-white/[0.055] text-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">
          No matching modes
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/46">
          Nothing matches <span className="break-words text-white/70">"{query}"</span>. Clear the
          search or try a different name.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="mt-5 h-8 rounded-[6px] border border-white/[0.075] bg-white/[0.04] px-2.5 text-white/74 hover:bg-white/[0.065] hover:text-foreground"
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      </div>
    </div>
  );
}
