export function ModeLibrarySkeleton() {
  return (
    <div className="divide-y divide-white/[0.055]">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex h-14 items-center gap-3 px-4">
          <div className="size-7 rounded-[4px] bg-white/[0.035]" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-[3px] bg-white/[0.045]" />
            <div className="h-2.5 w-16 rounded-[3px] bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}
