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
import { CategoryIcon } from "@/components/categories";
import type { CategoryTotal } from "@/hooks/useDashboardStats";
import { useMemo } from "react";

interface CurrencyBreakdownChartProps {
  categoryTotals: CategoryTotal[];
  primaryCurrency: string;
  periodLabel: string;
  isLoading: boolean;
}

interface PieDataItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  fill: string;
}

export function CurrencyBreakdownChart({
  categoryTotals,
  primaryCurrency,
  periodLabel,
  isLoading,
}: CurrencyBreakdownChartProps) {
  const { t } = useTranslation();

  const { chartConfig, pieData } = useMemo(() => {
    const config: ChartConfig = {};
    const data: PieDataItem[] = [];

    categoryTotals.forEach(({ id, name, icon, color, total }) => {
      const fill = color || "var(--muted-foreground)";

      config[id] = {
        label: name,
        color: fill,
      };

      data.push({
        id,
        name,
        icon,
        color: fill,
        total,
        fill,
      });
    });

    return { chartConfig: config, pieData: data };
  }, [categoryTotals]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: primaryCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [primaryCurrency],
  );

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
          {t("dashboard.categoryBreakdown")} - {periodLabel}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t("dashboard.categoryDistribution")}
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
                        <div className="flex min-w-40 items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <CategoryIcon
                              icon={payload.icon}
                              color={payload.color}
                              className="size-5"
                              iconClassName="size-3"
                            />
                            {payload.name}
                          </span>
                          <span className="font-mono font-medium">
                            {currencyFormatter.format(value)}
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
                nameKey="name"
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
                            {categoryTotals.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            {categoryTotals.length === 1
                              ? t("dashboard.categorySingular")
                              : t("dashboard.categoryPlural")}
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
        {pieData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 py-4">
            {categoryTotals.map((category) => {
              return (
                <div key={category.id} className="flex items-center gap-2">
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    className="size-5"
                    iconClassName="size-3"
                  />
                  <span className="text-sm text-muted-foreground">
                    {category.name}:{" "}
                    <span className="font-medium text-foreground">
                      {currencyFormatter.format(category.total)}
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
