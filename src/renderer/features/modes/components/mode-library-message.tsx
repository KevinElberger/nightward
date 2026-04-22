type ModeLibraryMessageProps = {
  description: string;
  title: string;
};

export function ModeLibraryMessage({ description, title }: ModeLibraryMessageProps) {
  return (
    <div className="px-4 py-5">
      <p className="text-sm font-medium text-white/78">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/42">{description}</p>
    </div>
  );
}
