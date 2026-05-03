import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ModeLibraryToolbarProps = {
  isCreating: boolean;
  modeCount: number;
  onCreateMode: () => void;
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
  showSearch: boolean;
};

export function ModeLibraryToolbar({
  isCreating,
  modeCount,
  onCreateMode,
  onSearchQueryChange,
  searchQuery,
  showSearch
}: ModeLibraryToolbarProps) {
  const modeCountLabel = `${modeCount} ${modeCount === 1 ? 'mode' : 'modes'}`;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="font-heading text-[2.45rem] font-semibold leading-[1.05] tracking-normal text-foreground">
          Modes
        </h2>
        <span
          className="mt-1 rounded-[6px] bg-white/[0.055] px-2 py-1 text-sm font-semibold leading-none text-white/50"
          aria-label={modeCountLabel}
        >
          {modeCount}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        {showSearch ? (
          <div className="relative w-full min-w-52 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/34"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value);
              }}
              aria-label="Search modes"
              placeholder="Search modes"
              className="h-9 rounded-[6px] border-surface-border bg-surface-field pl-9 text-sm text-foreground placeholder:text-white/28 focus-visible:border-ring focus-visible:ring-ring/35"
            />
          </div>
        ) : null}
        <Button
          type="button"
          size="xs"
          disabled={isCreating}
          className="h-9 rounded-[6px] px-3"
          onClick={onCreateMode}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New mode
        </Button>
      </div>
    </div>
  );
}
