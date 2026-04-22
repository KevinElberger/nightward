import { useState, type MouseEvent } from 'react';
import { Copy, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type ModeRowOverflowMenuProps = {
  isPinned?: boolean;
  modeName: string;
  onDeleteMode?: () => Promise<boolean>;
  onRename?: () => void;
  onSetPinned?: (isPinned: boolean) => Promise<unknown>;
};

export function ModeRowOverflowMenu({
  isPinned = false,
  modeName,
  onDeleteMode,
  onRename,
  onSetPinned
}: ModeRowOverflowMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (onDeleteMode === undefined || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleted = await onDeleteMode();

      if (deleted) {
        setIsDeleteDialogOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          <DropdownMenuItem
            disabled={onRename === undefined}
            onSelect={() => {
              onRename?.();
            }}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Copy className="size-3.5" aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={onSetPinned === undefined}
            onSelect={() => {
              void onSetPinned?.(!isPinned);
            }}
          >
            <Pin className="size-3.5" aria-hidden="true" />
            {isPinned ? 'Remove from sidebar' : 'Pin to sidebar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.07]" />
          <DropdownMenuItem
            disabled={onDeleteMode === undefined}
            variant="destructive"
            onSelect={() => {
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent
          className="rounded-[8px] border-white/[0.085] bg-[#09090a] text-foreground shadow-[0_18px_54px_rgba(0,0,0,0.55)]"
          size="default"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{modeName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This mode will be removed from Nightward. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                void handleConfirmDelete(event);
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
