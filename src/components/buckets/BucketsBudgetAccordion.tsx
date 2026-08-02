import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Expense, ExpenseBucket, ExpenseCategory } from "@/types";
import {
  getBucketBudgetSummaries,
  getTotalsByCurrency,
} from "@/components/buckets/bucketUtils";
import BucketStatsCard from "@/components/buckets/BucketStatsCard";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useMobile } from "@/hooks/useMobile";
import { Input } from "../ui/input";

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
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState("");
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

  const budgetSummaries = useMemo(() => {
    const allSummaries = totals ? [totals, ...summaries] : summaries;
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    if (!normalizedQuery) return allSummaries;

    return allSummaries.filter((summary) =>
      summary.bucket.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, summaries, totals]);

  if (buckets.length === 0) return null;

  return (
    <Card
      className={cn(
        "bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden",
        isMobile ? "gap-4" : "gap-0",
      )}
    >
      <CardHeader className="hover:no-underline px-4 flex justify-between items-center gap-2 w-full">
        <CardTitle className="flex items-center h-full">
          {t("buckets.monthlyBudgets")}
        </CardTitle>
        {onCustomizeMonth && (
          <CardAction>
            <Button type="button" size="icon" onClick={onCustomizeMonth}>
              <Settings2 className="size-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 py-2">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("common.search")}
          />
        </div>
        {budgetSummaries.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-1">
            {budgetSummaries.map((summary, index) => (
              <BucketStatsCard
                key={summary.bucket.id}
                summary={summary}
                isLoading={isLoadingRates}
                className={cn(
                  "border-b border-gray-200",
                  index === budgetSummaries.length - 1 && "border-b-0",
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
