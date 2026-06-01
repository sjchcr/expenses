import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/lib/categoryOptions";
import type { ExpenseCategory } from "@/types";
import { CategoryColorSelector } from "@/components/categories/CategoryColorSelector";
import { CategoryIconSelector } from "@/components/categories/CategoryIconSelector";

interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategory | null;
}

const createEmptyFormData = (): CategoryFormData => ({
  name: "",
  color: DEFAULT_CATEGORY_COLOR,
  icon: DEFAULT_CATEGORY_ICON,
});

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const [formData, setFormData] = useState<CategoryFormData>(
    createEmptyFormData(),
  );

  const isEditing = !!category;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && category) {
      setFormData({
        name: category.name,
        color: category.color || DEFAULT_CATEGORY_COLOR,
        icon: category.icon || DEFAULT_CATEGORY_ICON,
      });
    } else if (!open) {
      setFormData(createEmptyFormData());
    }
  }, [open, category]);

  const handleClose = () => {
    onOpenChange(false);
    setFormData(createEmptyFormData());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      };

      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          updates: payload,
        });
        toast.success(t("categories.updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("categories.created"));
      }
      handleClose();
    } catch {
      toast.error(t("categories.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={true}>
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {isEditing ? t("categories.edit") : t("categories.create")}
          </DialogTitle>
          <DialogDescription>{t("categories.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-name">{t("categories.name")} *</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                placeholder={t("categories.namePlaceholder")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("categories.color")}</Label>
              <CategoryColorSelector
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("categories.icon")}</Label>
              <CategoryIconSelector
                value={formData.icon}
                color={formData.color}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
          </form>
        </DialogBody>
        {isMobile ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isLoading}
            className="absolute right-4 top-4"
          >
            {isLoading ? <Spinner /> : <Check />}
          </Button>
        ) : (
          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? t("common.saving")
                : isEditing
                  ? t("common.update")
                  : t("common.create")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
