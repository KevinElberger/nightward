export function SidebarBrand() {
  return (
    <div className="app-drag relative px-4 pb-4 pt-11">
      <div className="flex items-center gap-3">
        <NightwardMark />
        <div className="min-w-0">
          <h1 className="font-heading text-sm font-semibold leading-none tracking-normal text-white/90">
            Nightward
          </h1>
        </div>
      </div>
    </div>
  );
}

function NightwardMark() {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-[7px] border border-white/[0.09] bg-white/[0.055] text-white/88 shadow-[0_14px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.09)]">
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
