import { Layers3 } from 'lucide-react';

export function ModeLibraryEmptyState() {
  return (
    <div className="flex min-h-44 items-center justify-center px-6 py-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex size-10 items-center justify-center rounded-[4px] border border-white/[0.07] bg-white/[0.055] text-white/50">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">
          No modes yet
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/42">
          Modes tell Nightward how your Mac should behave for a specific kind of work.
        </p>
      </div>
    </div>
  );
}
