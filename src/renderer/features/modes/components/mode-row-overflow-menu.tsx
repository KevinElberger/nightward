import { Copy, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type ModeRowOverflowMenuProps = {
  modeName: string;
};

export function ModeRowOverflowMenu({ modeName }: ModeRowOverflowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-[4px] text-white/38 outline-none transition-colors hover:bg-white/[0.05] hover:text-foreground focus-visible:bg-white/[0.05] focus-visible:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35 group-hover/row:text-white/58 group-focus-within/row:text-white/58 data-[state=open]:bg-white/[0.05] data-[state=open]:text-foreground"
        aria-label={`Open actions for ${modeName}`}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40 rounded-[6px] border-white/[0.08] bg-[#09090a]/95 text-white/80 shadow-[0_14px_42px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <DropdownMenuItem disabled>
          <Pencil className="size-3.5" aria-hidden="true" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Copy className="size-3.5" aria-hidden="true" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Pin className="size-3.5" aria-hidden="true" />
          Pin to sidebar
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/[0.07]" />
        <DropdownMenuItem disabled variant="destructive">
          <Trash2 className="size-3.5" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
