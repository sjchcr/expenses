import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import type { MonthlyData } from "@/hooks/useDashboardStats";

interface SpendingTrendsChartProps {
  monthlyTrends: MonthlyData[];
  currencies: string[];
  currentYear: number;
  isLoading: boolean;
}

interface ChartDataPoint {
  month: string;
  [currency: string]: string | number;
}

export function SpendingTrendsChart({
  monthlyTrends,
  currencies,
  currentYear,
  isLoading,
}: SpendingTrendsChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-75 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData: ChartDataPoint[] = monthlyTrends.map((month) => ({
    month: month.monthLabel,
    ...month.totals,
  }));

  // Get all unique currencies from the trends
  const activeCurrencies = currencies.filter((currency) =>
    monthlyTrends.some((month) => month.totals[currency] > 0),
  );

  // Determine which currencies go on which axis
  // CRC (colones) on left axis, USD (dollars) on right axis
  const leftAxisCurrencies = activeCurrencies.filter((c) => c === "CRC");
  const rightAxisCurrencies = activeCurrencies.filter((c) => c === "USD");
  // Other currencies default to left axis
  const otherCurrencies = activeCurrencies.filter(
    (c) => c !== "CRC" && c !== "USD",
  );

  // Build chart config dynamically with proper color references
  const chartConfig: ChartConfig = {};
  activeCurrencies.forEach((currency, index) => {
    const colorIndex = (index % 5) + 1;
    chartConfig[currency] = {
      label: currency,
      color: `var(--chart-${colorIndex})`,
    };
  });

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return String(value);
  };

  const hasLeftAxis =
    leftAxisCurrencies.length > 0 || otherCurrencies.length > 0;
  const hasRightAxis = rightAxisCurrencies.length > 0;

  return (
    <Card className="col-span-1 lg:col-span-2 bg-linear-180 from-background to-accent hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">
          {t("dashboard.spendingTrends")} - {currentYear}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t("dashboard.monthlySpendingByCurrency")}
          {hasLeftAxis && hasRightAxis && " (CRC left, USD right)"}
        </p>
      </CardHeader>
      <CardContent>
        {activeCurrencies.length === 0 ? (
          <div className="h-75 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("dashboard.noExpenseDataYet")}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: hasRightAxis ? 50 : 10,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                {activeCurrencies.map((currency, index) => {
                  const colorIndex = (index % 5) + 1;
                  return (
                    <linearGradient
                      key={currency}
                      id={`fill${currency}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--chart-${colorIndex})`}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--chart-${colorIndex})`}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
              />
              {/* Left Y-axis for CRC and other currencies */}
              {hasLeftAxis && (
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxisTick}
                  fontSize={10}
                  width={50}
                />
              )}
              {/* Right Y-axis for USD */}
              {hasRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxisTick}
                  fontSize={10}
                  width={50}
                />
              )}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => {
                      if (typeof value !== "number" || typeof name !== "string")
                        return null;
                      return (
                        <div className="flex min-w-32 justify-between gap-4">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: name,
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
              <ChartLegend content={<ChartLegendContent />} />
              {/* CRC areas on left axis */}
              {leftAxisCurrencies.map((currency, index) => {
                const colorIndex = (index % 5) + 1;
                return (
                  <Area
                    key={currency}
                    type="natural"
                    dataKey={currency}
                    yAxisId="left"
                    stroke={`var(--chart-${colorIndex})`}
                    fill={`url(#fill${currency})`}
                    strokeWidth={2}
                    stackId="left"
                  />
                );
              })}
              {/* Other currencies on left axis */}
              {otherCurrencies.map((currency) => {
                const originalIndex = activeCurrencies.indexOf(currency);
                const colorIndex = (originalIndex % 5) + 1;
                return (
                  <Area
                    key={currency}
                    type="natural"
                    dataKey={currency}
                    yAxisId={hasLeftAxis ? "left" : "right"}
                    stroke={`var(--chart-${colorIndex})`}
                    fill={`url(#fill${currency})`}
                    strokeWidth={2}
                    stackId="left"
                  />
                );
              })}
              {/* USD areas on right axis */}
              {rightAxisCurrencies.map((currency) => {
                const originalIndex = activeCurrencies.indexOf(currency);
                const colorIndex = (originalIndex % 5) + 1;
                return (
                  <Area
                    key={currency}
                    type="natural"
                    dataKey={currency}
                    yAxisId="right"
                    stroke={`var(--chart-${colorIndex})`}
                    fill={`url(#fill${currency})`}
                    strokeWidth={2}
                    stackId="right"
                  />
                );
              })}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
