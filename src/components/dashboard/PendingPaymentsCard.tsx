import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import type { CurrencyTotal } from "@/hooks/useDashboardStats";

interface PendingPaymentsCardProps {
  pendingPayments: CurrencyTotal[];
  currentMonthName: string;
  isLoading: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function PendingPaymentsCard({
  pendingPayments,
  currentMonthName,
  isLoading,
}: PendingPaymentsCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = pendingPayments.reduce((acc, p) => acc + p.count, 0);

  return (
    <Card className="col-span-1 bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-base">
            {t("dashboard.pendingPayments")} - {currentMonthName}
          </CardTitle>
        </div>
        {pendingPayments.length > 0 && (
          <CardAction>
            <Button variant="default" size="sm" asChild>
              <Link to="/expenses?filter=pending">
                {t("dashboard.viewAll")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {pendingPayments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("dashboard.noPendingPayments")}
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map(({ currency, total, count }) => (
              <div key={currency} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currency}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {count === 1 ? t("dashboard.expenseSingular", { count }) : t("dashboard.expensePlural", { count })}
                  </span>
                </div>
                <span className="font-semibold text-amber-600">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <span className="text-muted-foreground text-sm">
                {totalCount === 1
                  ? t("dashboard.totalPendingSingular", { count: totalCount })
                  : t("dashboard.totalPendingPlural", { count: totalCount })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
