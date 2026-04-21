export function SidebarBrand() {
  return (
    <div className="app-drag relative px-4 pb-3 pt-12">
      <div className="flex items-center gap-3">
        <NightwardMark />
        <div className="min-w-0">
          <h1 className="font-heading text-[0.78rem] font-semibold uppercase leading-none tracking-[0.22em] text-white/88">
            Nightward
          </h1>
        </div>
      </div>
    </div>
  );
}

function NightwardMark() {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.065] bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.012))] text-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg className="size-5" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M9 23V9L23 23V9"
          stroke="currentColor"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="2.35"
        />
        <circle className="fill-white/72" cx="23" cy="9" r="2.15" />
      </svg>
    </span>
  );
}
