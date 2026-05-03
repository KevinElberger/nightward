import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ModeLibraryToolbarProps = {
  isCreating: boolean;
  modeCount: number;
  onCreateMode: () => void;
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
};

export function ModeLibraryToolbar({
  isCreating,
  modeCount,
  onCreateMode,
  onSearchQueryChange,
  searchQuery
}: ModeLibraryToolbarProps) {
  const modeCountLabel = `${modeCount} ${modeCount === 1 ? 'mode' : 'modes'}`;

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-heading text-[1.7rem] font-semibold leading-tight text-foreground">
          Modes
        </h2>
        <p className="mt-1 text-sm leading-6 text-white/46">{modeCountLabel}</p>
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
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
