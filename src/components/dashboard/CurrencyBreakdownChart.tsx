import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CurrencyTotal } from "@/hooks/useDashboardStats";

interface CurrencyBreakdownChartProps {
  yearTotals: CurrencyTotal[];
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

interface PieDataItem {
  name: string;
  value: number;
  currency: string;
}

export function CurrencyBreakdownChart({
  yearTotals,
  currentYear,
  isLoading,
}: CurrencyBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-62.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for pie chart
  const pieData: PieDataItem[] = yearTotals.map(({ currency, total }) => ({
    name: currency,
    value: total,
    currency,
  }));

  return (
    <Card className="bg-linear-180 from-background to-gray-100 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">
          Spending by currency - {currentYear}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Total distribution across currencies
        </p>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <div className="h-62.5 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No expense data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
                itemStyle={{ fontSize: 12 }}
                formatter={(value, _name, props) => {
                  const payload = props.payload as PieDataItem;
                  if (typeof value !== "number") {
                    return [String(value), payload.currency];
                  }
                  return [
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payload.currency,
                      minimumFractionDigits: 2,
                    }).format(value),
                    payload.currency,
                  ];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
