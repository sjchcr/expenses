import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateExpenseBucket,
  useUpdateExpenseBucket,
} from "@/hooks/useExpenseBuckets";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import { CategoryIcon } from "@/components/categories";
import type { ExpenseBucket, ExpenseCategory } from "@/types";
import { BUDGET_CURRENCIES } from "./bucketUtils";

interface BucketFormData {
  name: string;
  monthly_budget: string;
  currency: string;
  category_ids: string[];
}

interface BucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket?: ExpenseBucket | null;
  categories: ExpenseCategory[];
  defaultCurrency: string;
}

const createEmptyFormData = (currency: string): BucketFormData => ({
  name: "",
  monthly_budget: "",
  currency,
  category_ids: [],
});

export function BucketDialog({
  open,
  onOpenChange,
  bucket,
  categories,
  defaultCurrency,
}: BucketDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const createMutation = useCreateExpenseBucket();
  const updateMutation = useUpdateExpenseBucket();
  const [formData, setFormData] = useState<BucketFormData>(() =>
    createEmptyFormData(defaultCurrency),
  );

  const isEditing = !!bucket;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && bucket) {
      setFormData({
        name: bucket.name,
        monthly_budget: String(bucket.monthly_budget),
        currency: bucket.currency,
        category_ids: bucket.category_ids,
      });
    } else if (!open) {
      setFormData(createEmptyFormData(defaultCurrency));
    }
  }, [bucket, defaultCurrency, open]);

  const handleClose = () => {
    onOpenChange(false);
    setFormData(createEmptyFormData(defaultCurrency));
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    setFormData((current) => ({
      ...current,
      category_ids: checked
        ? [...current.category_ids, categoryId]
        : current.category_ids.filter((id) => id !== categoryId),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("buckets.nameRequired"));
      return;
    }

    const monthlyBudget = Number(formData.monthly_budget);
    if (!Number.isFinite(monthlyBudget) || monthlyBudget < 0) {
      toast.error(t("buckets.budgetRequired"));
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        monthly_budget: monthlyBudget,
        currency: formData.currency,
        category_ids: formData.category_ids,
      };

      if (isEditing && bucket) {
        await updateMutation.mutateAsync({ id: bucket.id, updates: payload });
        toast.success(t("buckets.updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("buckets.created"));
      }
      handleClose();
    } catch {
      toast.error(t("buckets.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={true}>
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {isEditing ? t("buckets.edit") : t("buckets.create")}
          </DialogTitle>
          <DialogDescription>{t("buckets.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bucket-name">{t("buckets.name")} *</Label>
              <Input
                id="bucket-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                placeholder={t("buckets.namePlaceholder")}
                required
              />
            </div>

            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bucket-budget">
                  {t("buckets.monthlyBudget")} *
                </Label>
                <Input
                  id="bucket-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_budget}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      monthly_budget: event.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bucket-currency">{t("common.currency")}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(currency) =>
                    setFormData({ ...formData, currency })
                  }
                >
                  <SelectTrigger id="bucket-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("buckets.categories")}</Label>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border bg-background p-2">
                {categories.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    {t("categories.empty")}
                  </p>
                ) : (
                  categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={formData.category_ids.includes(category.id)}
                        onCheckedChange={(checked) =>
                          toggleCategory(category.id, checked === true)
                        }
                      />
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                        className="size-6"
                        iconClassName="size-3.5"
                      />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
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
