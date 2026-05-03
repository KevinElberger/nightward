export function ModeLibrarySkeleton() {
  return (
    <div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid min-h-[4.75rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-surface-border-subtle px-5 first:border-t-0"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="size-8 rounded-[6px] border border-white/[0.035] bg-white/[0.035]" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-[4px] bg-white/[0.05]" />
              <div className="h-2.5 w-44 max-w-[42vw] rounded-[4px] bg-white/[0.035]" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-8 w-24 rounded-[6px] bg-white/[0.035]" />
          </div>
        </div>
      ))}
    </div>
  );
}
