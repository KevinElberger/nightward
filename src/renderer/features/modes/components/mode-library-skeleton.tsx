export function ModeLibrarySkeleton() {
  return (
    <div className="divide-y divide-surface-border-subtle">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex h-16 items-center gap-3 px-4">
          <div className="size-8 rounded-[6px] border border-white/[0.035] bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-[4px] bg-white/[0.05]" />
            <div className="h-2.5 w-16 rounded-[4px] bg-white/[0.035]" />
          </div>
        </div>
      ))}
    </div>
  );
}
