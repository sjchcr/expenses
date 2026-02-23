import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteStockPeriod } from "@/hooks/useStocks";

interface DeleteStockPeriodDialogProps {
  periodId: string | null;
  onClose: () => void;
}

export function DeleteStockPeriodDialog({
  periodId,
  onClose,
}: DeleteStockPeriodDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteStockPeriod();

  const handleDelete = async () => {
    if (!periodId) return;

    try {
      await deleteMutation.mutateAsync(periodId);
      toast.success(t("stocks.periodDeleted"));
    } catch {
      toast.error(t("stocks.periodDeleteFailed"));
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={!!periodId} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-sm"
        showCloseButton={false}
        fromBottom={false}
      >
        <DialogHeader>
          <DialogTitle>{t("stocks.deletePeriod")}</DialogTitle>
          <DialogDescription>
            {t("stocks.deletePeriodConfirm")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full">
              {t("common.cancel")}
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            {deleteMutation.isPending
              ? t("common.deleting")
              : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
