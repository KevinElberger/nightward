export function SidebarSkeleton() {
  return (
    <div className="space-y-px px-1">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-10 rounded-[4px] bg-white/[0.035]" />
      ))}
    </div>
  );
}
