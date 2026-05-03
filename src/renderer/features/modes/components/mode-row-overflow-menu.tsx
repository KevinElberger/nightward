import { useState, type MouseEvent } from 'react';
import { Copy, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  showRenameOption?: boolean;
  triggerClassName?: string;
};

export function ModeRowOverflowMenu({
  isPinned = false,
  modeName,
  onDeleteMode,
  onRename,
  onSetPinned,
  showRenameOption = true,
  triggerClassName
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
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-[6px] text-white/40 outline-none transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:bg-white/[0.06] focus-visible:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35 group-hover/row:text-white/60 group-focus-within/row:text-white/60 data-[state=open]:bg-white/[0.065] data-[state=open]:text-foreground',
            triggerClassName
          )}
          aria-label={`Open actions for ${modeName}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-44 rounded-[8px] border-surface-border-strong bg-popover/95 p-1 text-white/80 shadow-[0_18px_54px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl"
        >
          {showRenameOption ? (
            <DropdownMenuItem
              disabled={onRename === undefined}
              onSelect={() => {
                onRename?.();
              }}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Rename
            </DropdownMenuItem>
          ) : null}
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
          <DropdownMenuSeparator className="my-1 bg-white/[0.07]" />
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
          className="rounded-[8px] border-surface-border-strong bg-card text-foreground"
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
