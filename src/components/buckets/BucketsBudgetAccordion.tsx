import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
}

export function BucketsBudgetAccordion({
  buckets,
  categories,
  expenses,
  exchangeRates,
  isLoadingRates,
}: BucketsBudgetAccordionProps) {
  const { t } = useTranslation();
  const summaries = useMemo(
    () =>
      getBucketBudgetSummaries({
        buckets,
        categories,
        expenses,
        exchangeRates,
      }),
    [buckets, categories, exchangeRates, expenses],
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
