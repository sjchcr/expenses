import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, CircleDashed, Receipt, CircleCheck } from "lucide-react";
import type {
  CurrencyTotal,
  DashboardStatsPeriod,
} from "@/hooks/useDashboardStats";

interface QuickStatsCardsProps {
  yearTotals: CurrencyTotal[];
  paidVsPending: {
    paid: { currency: string; total: number }[];
    pending: { currency: string; total: number }[];
  };
  totalExpensesCount: number;
  period: DashboardStatsPeriod;
  periodLabel: string;
  isLoading: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function QuickStatsCards({
  yearTotals,
  paidVsPending,
  totalExpensesCount,
  period,
  periodLabel,
  isLoading,
}: QuickStatsCardsProps) {
  const { t } = useTranslation();
  const periodScope =
    period === "monthly"
      ? t("dashboard.thisMonth")
      : t("dashboard.thisYear");

  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Total Expenses Count */}
      <Card className="bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{t("dashboard.totalExpenses")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalExpensesCount}</p>
          <p className="text-muted-foreground text-sm mt-1">
            {t("dashboard.trackedInPeriod", { period: periodLabel })}
          </p>
        </CardContent>
      </Card>

      {/* Total Year Spend */}
      <Card className="bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">
              {t("dashboard.totalSpendPeriod", { period: periodScope })}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {yearTotals.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("dashboard.noExpensesYet")}</p>
          ) : (
            <div className="space-y-2">
              {yearTotals.map(({ currency, total }) => (
                <div key={currency} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                  <span className="font-semibold">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Expenses */}
      <Card className="bg-linear-180 from-background to-green-50 dark:to-green-950/50 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-green-700" />
            <CardTitle className="text-base">{t("common.paid")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {paidVsPending.paid.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("dashboard.noPaidExpenses")}</p>
          ) : (
            <div className="space-y-2">
              {paidVsPending.paid.map(({ currency, total }) => (
                <div key={currency} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Expenses */}
      <Card className="bg-linear-180 from-background to-amber-50 dark:to-amber-950/50 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleDashed className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base">{t("common.pending")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {paidVsPending.pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("dashboard.allPaidUp")}</p>
          ) : (
            <div className="space-y-2">
              {paidVsPending.pending.map(({ currency, total }) => (
                <div key={currency} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                  <span className="font-semibold text-amber-600">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
