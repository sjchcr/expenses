import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyData } from "@/hooks/useDashboardStats";

interface SpendingTrendsChartProps {
  monthlyTrends: MonthlyData[];
  currencies: string[];
  currentYear: number;
  isLoading: boolean;
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

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
  if (isLoading) {
    return (
      <Card className="col-span-2">
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

  return (
    <Card className="col-span-2 bg-linear-180 from-background to-gray-100 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">
          Spending trends - {currentYear}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Monthly spending by currency
        </p>
      </CardHeader>
      <CardContent>
        {activeCurrencies.length === 0 ? (
          <div className="h-75 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No expense data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                fontSize={10}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-foreground)", fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                formatter={(value, name) => {
                  if (typeof value !== "number" || typeof name !== "string") {
                    return [String(value), String(name)];
                  }
                  return [
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: name,
                      minimumFractionDigits: 2,
                    }).format(value),
                    name,
                  ];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {activeCurrencies.map((currency, index) => (
                <Line
                  key={currency}
                  type="monotone"
                  dataKey={currency}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[index % CHART_COLORS.length] }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
