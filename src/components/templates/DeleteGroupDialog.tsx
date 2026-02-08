import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteTemplateGroup } from "@/hooks/useTemplateGroups";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TemplateGroup } from "@/types";

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: TemplateGroup | null;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
}: DeleteGroupDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTemplateGroup();

  const handleConfirmDelete = async () => {
    if (group) {
      try {
        await deleteMutation.mutateAsync(group.id);
        toast.success(t("groups.groupDeleted"));
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("groups.deleteGroup")}</DialogTitle>
          <DialogDescription>
            {t("groups.deleteGroupDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-1 font-medium">{t("groups.groupName")}</p>
          <p className="col-span-2 text-gray-600">{group?.name}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-1 font-medium">
            {t("groups.groupTemplates")}s
          </p>
          <p className="col-span-2 text-gray-600">
            {group?.template_ids.length}{" "}
            {t("groups.groupTemplates").toLowerCase()}
            {group?.template_ids.length !== 1 ? "s" : ""}
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
