import {
  formatBudgetAmount,
  getCurrencySymbol,
  getPercentage,
  type BucketBudgetSummary,
} from "@/components/buckets/bucketUtils";
import { Progress } from "@/components/ui/progress";
import { t } from "i18next";
import { cn } from "@/lib/utils";

const BucketStatsCard = ({
  summary,
  isLoading,
  className,
}: {
  summary: BucketBudgetSummary;
  isLoading: boolean;
  className?: string;
}) => {
  const budget = summary.bucket.monthly_budget;
  const spentPercent =
    budget > 0 ? Math.min((summary.spent / budget) * 100, 100) : 0;
  const isNegative = summary.remaining < 0;
  return (
    <div
      key={summary.bucket.id}
      className={cn("p-4 transition-colors hover:bg-primary/5", className)}
    >
      <p className="truncate text-sm font-semibold">{summary.bucket.name}</p>
      <div className="grid gap-2 items-start">
        <div>
          <p className="text-xs text-muted-foreground">
            {getCurrencySymbol(summary.bucket.currency)}
            {formatBudgetAmount(summary.bucket.monthly_budget)}{" "}
            {t("buckets.budget")}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <Progress
              value={spentPercent}
              className={cn(
                isNegative
                  ? "*:data-[slot=progress-indicator]:bg-red-500 bg-red-100"
                  : "*:data-[slot=progress-indicator]:bg-emerald-700 bg-emerald-200",
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t("buckets.spent")}</p>
            <p className="flex gap-1 font-medium tabular-nums">
              {summary.hasAllRates ? (
                <>
                  {getCurrencySymbol(summary.bucket.currency)}
                  {formatBudgetAmount(summary.spent)}
                  <span className="text-muted-foreground">
                    (
                    {getPercentage(
                      summary.bucket.monthly_budget,
                      summary.spent,
                    ).toFixed(1)}
                    %)
                  </span>
                </>
              ) : isLoading ? (
                t("common.loading")
              ) : (
                t("expenses.missingRates")
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("buckets.remaining")}</p>
            <p
              className={cn(
                "flex gap-1 font-medium tabular-nums",
                isNegative && "text-red-600",
              )}
            >
              {summary.hasAllRates ? (
                <>
                  {isNegative ? "-" : ""}
                  {getCurrencySymbol(summary.bucket.currency)}
                  {formatBudgetAmount(Math.abs(summary.remaining))}
                  <span
                    className={cn(
                      "text-muted-foreground",
                      isNegative && "text-red-400",
                    )}
                  >
                    (
                    {getPercentage(
                      summary.bucket.monthly_budget,
                      summary.remaining,
                    ).toFixed(1)}
                    %)
                  </span>
                </>
              ) : isLoading ? (
                t("common.loading")
              ) : (
                t("expenses.missingRates")
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketStatsCard;
