import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MonthComparison } from "@/hooks/useDashboardStats";

interface MonthComparisonCardProps {
  monthComparison: MonthComparison[];
  currentMonthName: string;
  previousMonthName: string;
  isLoading: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number): string {
  const formatted = Math.abs(value).toFixed(1);
  return `${formatted}%`;
}

export function MonthComparisonCard({
  monthComparison,
  currentMonthName,
  previousMonthName,
  isLoading,
}: MonthComparisonCardProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Month-over-month comparison</CardTitle>
        <p className="text-muted-foreground text-sm">
          {previousMonthName} vs {currentMonthName}
        </p>
      </CardHeader>
      <CardContent>
        {monthComparison.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data available</p>
        ) : (
          <div className="space-y-4">
            {monthComparison.map(
              ({
                currency,
                currentMonth,
                previousMonth,
                change,
                changePercent,
              }) => {
                const isIncrease = change > 0;
                const isDecrease = change < 0;
                const isNoChange = change === 0;

                return (
                  <div key={currency} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{currency}</Badge>
                      <div className="flex items-center gap-2">
                        {isIncrease && (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        )}
                        {isDecrease && (
                          <TrendingDown className="h-4 w-4 text-green-700" />
                        )}
                        {isNoChange && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isIncrease
                              ? "text-destructive"
                              : isDecrease
                                ? "text-green-700"
                                : "text-muted-foreground"
                          }`}
                        >
                          {isIncrease ? "+" : ""}
                          {formatCurrency(change, currency)}
                          {previousMonth > 0 && (
                            <span className="ml-1">
                              ({isIncrease ? "+" : ""}
                              {formatPercent(changePercent)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          {previousMonthName}
                        </p>
                        <p className="font-medium">
                          {formatCurrency(previousMonth, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {currentMonthName}
                        </p>
                        <p className="font-medium">
                          {formatCurrency(currentMonth, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
