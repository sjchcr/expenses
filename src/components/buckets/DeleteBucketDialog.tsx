import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteExpenseBucket } from "@/hooks/useExpenseBuckets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseBucket } from "@/types";

interface DeleteBucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket: ExpenseBucket | null;
}

export function DeleteBucketDialog({
  open,
  onOpenChange,
  bucket,
}: DeleteBucketDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteExpenseBucket();

  const handleDelete = async () => {
    if (!bucket) return;

    try {
      await deleteMutation.mutateAsync(bucket.id);
      toast.success(t("buckets.deleted"));
      onOpenChange(false);
    } catch {
      toast.error(t("buckets.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buckets.delete")}</DialogTitle>
          <DialogDescription>
            {t("buckets.deleteDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-muted/50 p-3 text-sm">
          <span className="font-medium">{t("buckets.name")}</span>
          <p className="text-muted-foreground">{bucket?.name}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
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
