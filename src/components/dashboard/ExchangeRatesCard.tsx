import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { ExchangeRateDisplay } from "@/hooks/useDashboardStats";

interface ExchangeRatesCardProps {
  exchangeRates: ExchangeRateDisplay[];
  primaryCurrency: string;
  isLoading: boolean;
}

function formatRate(rate: number): string {
  return rate.toFixed(4);
}

export function ExchangeRatesCard({
  exchangeRates,
  primaryCurrency,
  isLoading,
}: ExchangeRatesCardProps) {
  if (isLoading) {
    return (
      <Card>
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

  return (
    <Card className="bg-linear-180 from-background to-gray-100 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Today's exchange rates</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Rates to {primaryCurrency}
        </p>
      </CardHeader>
      <CardContent>
        {exchangeRates.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No exchange rates needed (single currency)
          </p>
        ) : (
          <div className="space-y-3">
            {exchangeRates.map(({ from, to, rate }) => (
              <div
                key={`${from}-${to}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">1 {from}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline">{to}</Badge>
                </div>
                <span className="font-mono font-medium">
                  {formatRate(rate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
