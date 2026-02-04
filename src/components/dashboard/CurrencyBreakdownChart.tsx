import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Label } from "recharts";
import type { CurrencyTotal } from "@/hooks/useDashboardStats";
import { useMemo } from "react";

interface CurrencyBreakdownChartProps {
  yearTotals: CurrencyTotal[];
  currentYear: number;
  isLoading: boolean;
}

interface PieDataItem {
  currency: string;
  total: number;
  fill: string;
}

export function CurrencyBreakdownChart({
  yearTotals,
  currentYear,
  isLoading,
}: CurrencyBreakdownChartProps) {
  const { t } = useTranslation();

  // Build chart config and pie data
  const { chartConfig, pieData } = useMemo(() => {
    const config: ChartConfig = {};
    const data: PieDataItem[] = [];

    yearTotals.forEach(({ currency, total }, index) => {
      const colorIndex = (index % 5) + 1;
      const color = `var(--chart-${colorIndex})`;

      config[currency] = {
        label: currency,
        color,
      };

      data.push({
        currency,
        total,
        fill: color,
      });
    });

    return { chartConfig: config, pieData: data };
  }, [yearTotals]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-62.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">
          {t("dashboard.currencyBreakdown")} - {currentYear}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t("dashboard.totalDistribution")}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {pieData.length === 0 ? (
          <div className="h-62.5 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("dashboard.noExpenseDataYet")}</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-64"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, props) => {
                      const payload = props.payload as PieDataItem;
                      if (typeof value !== "number") return null;
                      return (
                        <div className="flex min-w-32 justify-between gap-4">
                          <span className="text-muted-foreground">
                            {payload.currency}
                          </span>
                          <span className="font-mono font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: payload.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(value)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="total"
                nameKey="currency"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {yearTotals.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            {yearTotals.length === 1
                              ? t("dashboard.currencySingular")
                              : t("dashboard.currencyPlural")}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        {/* Legend below chart */}
        {pieData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 py-4">
            {yearTotals.map(({ currency, total }, index) => {
              const colorIndex = (index % 5) + 1;
              return (
                <div key={currency} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: `var(--chart-${colorIndex})`,
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {currency}:{" "}
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(total)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
