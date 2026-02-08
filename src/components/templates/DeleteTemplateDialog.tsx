import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteTemplate } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseTemplate } from "@/types";
import { formatAmountsDisplay } from "@/pages/Templates";

interface DeleteTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ExpenseTemplate | null;
}

export function DeleteTemplateDialog({
  open,
  onOpenChange,
  template,
}: DeleteTemplateDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTemplate();

  const handleConfirmDelete = async () => {
    if (template) {
      try {
        await deleteMutation.mutateAsync(template.id);
        toast.success(t("templates.templateDeleted"));
        onOpenChange(false);
      } catch {
        toast.error(t("common.deleting"));
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("templates.deleteTemplate")}</DialogTitle>
          <DialogDescription>
            {t("templates.deleteTemplateDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-1 font-medium">
            {t("templates.templateName")}
          </p>
          <p className="col-span-2 text-gray-600">{template?.name}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-1 font-medium">
            {t("templates.currenciesAmounts")}
          </p>
          <p className="col-span-2 text-gray-600">
            {formatAmountsDisplay(template?.amounts || [])}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
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
