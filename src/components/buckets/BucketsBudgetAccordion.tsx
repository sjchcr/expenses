import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Expense, ExpenseBucket, ExpenseCategory } from "@/types";
import {
  getBucketBudgetSummaries,
  getTotalsByCurrency,
} from "@/components/buckets/bucketUtils";
import BucketStatsCard from "@/components/buckets/BucketStatsCard";

interface BucketsBudgetAccordionProps {
  buckets: ExpenseBucket[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  exchangeRates: Record<string, number> | undefined;
  isLoadingRates: boolean;
  excludedCategoryIds?: string[];
  bucketBudgetOverrides?: Record<string, number>;
  onCustomizeMonth?: () => void;
}

export function BucketsBudgetAccordion({
  buckets,
  categories,
  expenses,
  exchangeRates,
  isLoadingRates,
  excludedCategoryIds = [],
  bucketBudgetOverrides = {},
  onCustomizeMonth,
}: BucketsBudgetAccordionProps) {
  const { t } = useTranslation();
  const summaries = useMemo(
    () =>
      getBucketBudgetSummaries({
        buckets,
        categories,
        expenses,
        exchangeRates,
        excludedCategoryIds,
        bucketBudgetOverrides,
      }),
    [
      bucketBudgetOverrides,
      buckets,
      categories,
      exchangeRates,
      excludedCategoryIds,
      expenses,
    ],
  );

  const totals = useMemo(() => {
    return getTotalsByCurrency(summaries);
  }, [summaries]);

  if (buckets.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="budgets"
      className="rounded-2xl border bg-linear-to-b from-background to-accent shadow-md dark:border-gray-900"
    >
      <AccordionItem value="budgets" className="border-b-0 px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="text-left flex flex-col gap-1">
            <p className="leading-none font-semibold text-[16px] flex items-center h-full">
              {t("buckets.monthlyBudgets")}
            </p>
            <p className="text-sm font-normal text-muted-foreground">
              {t("buckets.monthlyBudgetsDescription")}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {onCustomizeMonth && (
            <div className="mb-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCustomizeMonth}
              >
                <Settings2 className="size-4" />
                {t("buckets.customizeMonth")}
              </Button>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {totals && (
              <BucketStatsCard summary={totals} isLoading={isLoadingRates} />
            )}
            {summaries.map((summary) => (
              <BucketStatsCard
                key={summary.bucket.id}
                summary={summary}
                isLoading={isLoadingRates}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
