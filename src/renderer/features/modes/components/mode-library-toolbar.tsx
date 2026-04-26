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
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="relative w-full max-w-sm">
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
          className="h-9 rounded-[4px] border-surface-border bg-surface-field pl-9 text-sm text-foreground placeholder:text-white/28 focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs font-medium text-white/38">{modeCountLabel}</span>
        <Button
          type="button"
          size="xs"
          disabled={isCreating}
          className="h-9 rounded-[4px] bg-primary px-3 text-primary-foreground hover:bg-primary/90"
          onClick={onCreateMode}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New mode
        </Button>
      </div>
    </div>
  );
}
