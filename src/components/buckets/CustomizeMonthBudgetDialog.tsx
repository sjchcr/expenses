import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  formatBudgetAmount,
  getCurrencySymbol,
} from "@/components/buckets/bucketUtils";
import type { ExpenseBucket, ExpenseCategory } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";

interface CustomizeMonthBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: ExpenseBucket[];
  categories: ExpenseCategory[];
  monthLabel: string;
  excludedCategoryIds: string[];
  bucketBudgetOverrides: Record<string, number>;
  isSaving: boolean;
  onSave: (values: {
    excludedCategoryIds: string[];
    bucketBudgetOverrides: Record<string, number>;
  }) => Promise<void>;
}

export function CustomizeMonthBudgetDialog({
  open,
  onOpenChange,
  buckets,
  categories,
  monthLabel,
  excludedCategoryIds,
  bucketBudgetOverrides,
  isSaving,
  onSave,
}: CustomizeMonthBudgetDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buckets.customizeMonth")}</DialogTitle>
          <DialogDescription>
            {t("buckets.customizeMonthDescription", { month: monthLabel })}
          </DialogDescription>
        </DialogHeader>

        <CustomizeMonthBudgetForm
          key={`${monthLabel}-${excludedCategoryIds.join("|")}-${JSON.stringify(
            bucketBudgetOverrides,
          )}`}
          buckets={buckets}
          categories={categories}
          excludedCategoryIds={excludedCategoryIds}
          bucketBudgetOverrides={bucketBudgetOverrides}
          isSaving={isSaving}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}

function CustomizeMonthBudgetForm({
  buckets,
  categories,
  excludedCategoryIds,
  bucketBudgetOverrides,
  isSaving,
  onSave,
}: Pick<
  CustomizeMonthBudgetDialogProps,
  | "buckets"
  | "categories"
  | "excludedCategoryIds"
  | "bucketBudgetOverrides"
  | "isSaving"
  | "onSave"
>) {
  const { t } = useTranslation();
  const [draftExcludedIds, setDraftExcludedIds] =
    useState<string[]>(excludedCategoryIds);
  const [draftBudgetOverrides, setDraftBudgetOverrides] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      Object.entries(bucketBudgetOverrides).map(([bucketId, amount]) => [
        bucketId,
        String(amount),
      ]),
    ),
  );

  const categoriesById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const draftExcludedSet = useMemo(
    () => new Set(draftExcludedIds),
    [draftExcludedIds],
  );

  const toggleCategory = (categoryId: string, include: boolean) => {
    setDraftExcludedIds((current) => {
      if (include) return current.filter((id) => id !== categoryId);
      if (current.includes(categoryId)) return current;
      return [...current, categoryId];
    });
  };

  const updateBucketBudget = (bucketId: string, value: string) => {
    setDraftBudgetOverrides((current) => ({
      ...current,
      [bucketId]: value,
    }));
  };

  const resetBucketBudget = (bucketId: string) => {
    setDraftBudgetOverrides((current) => {
      const next = { ...current };
      delete next[bucketId];
      return next;
    });
  };

  const handleSave = async () => {
    const nextBucketBudgetOverrides = Object.entries(
      draftBudgetOverrides,
    ).reduce<Record<string, number>>((acc, [bucketId, value]) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return acc;

      const amount = Number(trimmedValue);
      if (Number.isFinite(amount) && amount >= 0) {
        acc[bucketId] = amount;
      }

      return acc;
    }, {});

    await onSave({
      excludedCategoryIds: draftExcludedIds,
      bucketBudgetOverrides: nextBucketBudgetOverrides,
    });
  };

  return (
    <>
      <DialogBody className="space-y-4">
        {buckets.map((bucket) => {
          const bucketCategories = bucket.category_ids
            .map((categoryId) => categoriesById.get(categoryId))
            .filter((category): category is ExpenseCategory => !!category);
          const bucketSelectedCategories = bucketCategories.filter((category) =>
            draftExcludedSet.has(category.id),
          );
          const bucketStatus =
            draftBudgetOverrides[bucket.id] !== String(bucket.monthly_budget) &&
            draftBudgetOverrides[bucket.id]
              ? "overridden"
              : bucketSelectedCategories.length !== bucketCategories.length
                ? "active"
                : "inactive";

          return (
            <section
              key={bucket.id}
              className="border border-lg rounded-lg overflow-auto"
            >
              <div className="flex flex-col gap-2 bg-background p-3">
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <p className="text-sm font-semibold">{bucket.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("buckets.defaultBudget", {
                        amount: `${getCurrencySymbol(
                          bucket.currency,
                        )}${formatBudgetAmount(bucket.monthly_budget)}`,
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      bucketStatus === "overridden"
                        ? "warning"
                        : bucketSelectedCategories.length !==
                            bucketCategories.length
                          ? "success"
                          : "destructiveLight"
                    }
                  >
                    {bucketStatus === "overridden"
                      ? t("buckets.overridden")
                      : bucketSelectedCategories.length !==
                          bucketCategories.length
                        ? t("buckets.active")
                        : t("buckets.inactive")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {getCurrencySymbol(bucket.currency)}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={draftBudgetOverrides[bucket.id] || ""}
                      onChange={(event) =>
                        updateBucketBudget(bucket.id, event.target.value)
                      }
                      placeholder={formatBudgetAmount(bucket.monthly_budget)}
                      className="pl-8"
                      aria-label={t("buckets.monthlyBudgetOverride", {
                        bucket: bucket.name,
                      })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => resetBucketBudget(bucket.id)}
                    disabled={isSaving || !draftBudgetOverrides[bucket.id]}
                    aria-label={t("buckets.resetBucketBudget", {
                      bucket: bucket.name,
                    })}
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </div>
                {bucketCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("buckets.noCategories")}
                  </p>
                )}
              </div>

              {bucketCategories.length > 0 && <Separator />}

              {bucketCategories.map((category) => {
                const checkboxId = `month-budget-category-${category.id}`;
                const checked = !draftExcludedSet.has(category.id);

                return (
                  <Label
                    key={category.id}
                    htmlFor={checkboxId}
                    className="flex min-h-12 cursor-pointer items-center gap-3 bg-background p-3 text-sm"
                  >
                    <Checkbox
                      id={checkboxId}
                      size="small"
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleCategory(category.id, value === true)
                      }
                    />
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      className="size-7"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {category.name}
                    </span>
                  </Label>
                );
              })}
            </section>
          );
        })}
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDraftExcludedIds([]);
            setDraftBudgetOverrides({});
          }}
          disabled={isSaving}
        >
          <RotateCcw className="size-4" />
          {t("buckets.useDefaults")}
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogFooter>
    </>
  );
}
