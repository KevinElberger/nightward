export function SidebarSkeleton() {
  return (
    <div className="space-y-1 px-1">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-10 rounded-[6px] border border-white/[0.035] bg-white/[0.035]"
        />
      ))}
    </div>
  );
}
