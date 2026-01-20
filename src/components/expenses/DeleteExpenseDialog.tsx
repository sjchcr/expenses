import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types";

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
  isDeleting,
}: DeleteExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {expense && (
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="text-sm text-gray-900">{expense.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm text-gray-900">
                  {expense.amounts.map((a) => `${a.currency} ${a.amount.toFixed(2)}`).join(", ")}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
