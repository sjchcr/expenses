import {
  formatBudgetAmount,
  getCurrencySymbol,
  type BucketBudgetSummary,
} from "./bucketUtils";
import { Progress } from "../ui/progress";
import { t } from "i18next";
import { cn } from "@/lib/utils";

const BucketStatsCard = ({
  summary,
  isLoading,
}: {
  summary: BucketBudgetSummary;
  isLoading: boolean;
}) => {
  const budget = summary.bucket.monthly_budget;
  const spentPercent =
    budget > 0 ? Math.min((summary.spent / budget) * 100, 100) : 0;
  const isNegative = summary.remaining < 0;
  return (
    <div
      key={summary.bucket.id}
      className="rounded-xl border bg-background p-3 shadow-sm"
    >
      <div className="flex flex-col items-start justify-between gap-1">
        <p className="truncate text-sm font-semibold">{summary.bucket.name}</p>
        <p className="text-xs text-muted-foreground">
          {getCurrencySymbol(summary.bucket.currency)}
          {formatBudgetAmount(summary.bucket.monthly_budget)}{" "}
          {t("buckets.budget")}
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <Progress
          value={spentPercent}
          className={cn(
            isNegative
              ? "*:data-[slot=progress-indicator]:bg-red-500 bg-red-100"
              : "*:data-[slot=progress-indicator]:bg-emerald-500 bg-emerald-100",
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">{t("buckets.spent")}</p>
          <p className="font-medium tabular-nums">
            {summary.hasAllRates ? (
              <>
                {getCurrencySymbol(summary.bucket.currency)}
                {formatBudgetAmount(summary.spent)}
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
              "font-medium tabular-nums",
              isNegative && "text-red-600",
            )}
          >
            {summary.hasAllRates ? (
              <>
                {isNegative ? "-" : ""}
                {getCurrencySymbol(summary.bucket.currency)}
                {formatBudgetAmount(Math.abs(summary.remaining))}
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
  );
};

export default BucketStatsCard;
