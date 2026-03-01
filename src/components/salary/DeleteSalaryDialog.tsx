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
import { useDeleteSalaryRecord } from "@/hooks/useSalary";

interface DeleteSalaryDialogProps {
  recordId: string | null;
  onClose: () => void;
}

export function DeleteSalaryDialog({
  recordId,
  onClose,
}: DeleteSalaryDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteSalaryRecord();

  const handleDelete = async () => {
    if (!recordId) return;
    try {
      await deleteMutation.mutateAsync(recordId);
      toast.success(t("salary.salaryDeleted"));
    } catch {
      toast.error(t("salary.deleteFailed"));
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={!!recordId} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-sm"
        showCloseButton={false}
        fromBottom={false}
      >
        <DialogHeader>
          <DialogTitle>{t("salary.deleteSalary")}</DialogTitle>
          <DialogDescription>{t("salary.deleteConfirm")}</DialogDescription>
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
