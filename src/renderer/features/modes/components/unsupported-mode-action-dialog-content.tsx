import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type UnsupportedModeActionDialogContentProps = {
  onClose: () => void;
};

export function UnsupportedModeActionDialogContent({
  onClose
}: UnsupportedModeActionDialogContentProps) {
  return (
    <div className="p-6">
      <DialogHeader>
        <DialogTitle>Unsupported action type</DialogTitle>
        <DialogDescription>This action type is not wired into the composer yet.</DialogDescription>
      </DialogHeader>
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-[4px] border border-surface-border bg-surface-control px-3 text-white/58 hover:bg-surface-hover hover:text-foreground"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
