import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseCategory } from "@/types";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ExpenseCategory | null;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: DeleteCategoryDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteCategory();

  const handleDelete = async () => {
    if (!category) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success(t("categories.deleted"));
      onOpenChange(false);
    } catch {
      toast.error(t("categories.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("categories.delete")}</DialogTitle>
          <DialogDescription>
            {t("categories.deleteDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <span className="font-medium">{t("categories.name")}</span>
          <span className="col-span-2 text-muted-foreground">
            {category?.name}
          </span>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
