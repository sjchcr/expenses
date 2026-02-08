import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("expenses.deleteExpense")}</DialogTitle>
          <DialogDescription>
            {t("expenses.deleteConfirmGeneric")}
          </DialogDescription>
        </DialogHeader>

        {expense && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <p className="col-span-1 font-medium">{t("common.name")}</p>
              <p className="col-span-2 text-gray-600 text-right">
                {expense.name}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="col-span-1 font-medium">{t("common.amount")}</p>
              <p className="col-span-2 text-gray-600 text-right">
                {expense.amounts
                  .map((a) => `${a.currency} ${a.amount.toFixed(2)}`)
                  .join(", ")}
              </p>
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
