type ModeLibraryMessageProps = {
  description: string;
  title: string;
};

export function ModeLibraryMessage({ description, title }: ModeLibraryMessageProps) {
  return (
    <div className="flex min-h-56 items-center justify-center px-6 py-10 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-white/82">{title}</p>
        <p className="mt-2 text-xs leading-5 text-white/46">{description}</p>
      </div>
    </div>
  );
}
