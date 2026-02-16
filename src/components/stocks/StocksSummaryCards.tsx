import { useTranslation } from "react-i18next";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type CardProps,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockYearTotals } from "@/types";
import { formatUsd } from "@/lib/stockCalculations";
import { cn } from "@/lib/utils";

interface StocksSummaryCardsProps {
  totals: StockYearTotals;
  isLoading: boolean;
}

interface CardsProps {
  id: string;
  variant: CardProps["variant"];
  title: string;
  value: string;
  icon?: LucideIcon;
  description: string;
}

export function StocksSummaryCards({
  totals,
  isLoading,
}: StocksSummaryCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards: CardsProps[] = [
    {
      id: "grossTotal",
      variant: "success",
      title: t("stocks.grossTotal"),
      value: formatUsd(totals.grossUsd),
      icon: DollarSign,
      description: t("stocks.grossTotalDesc", { count: totals.periodCount }),
    },
    {
      id: "netTotal",
      variant: "success",
      title: t("stocks.netTotal"),
      value: formatUsd(totals.netUsd),
      icon: TrendingUp,
      description: t("stocks.netTotalDesc"),
    },
    {
      id: "totalTaxes",
      variant: "destructive",
      title: t("stocks.totalTaxes"),
      value: formatUsd(totals.usTaxUsd + totals.localTaxUsd),
      icon: Landmark,
      description: t("stocks.totalTaxesDesc"),
    },
    {
      id: "totalBrokerCosts",
      variant: "destructive",
      title: t("stocks.totalBrokerCosts"),
      value: formatUsd(totals.brokerCostUsd),
      icon: Receipt,
      description: t("stocks.totalBrokerCostsDesc"),
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.id} variant={card.variant}>
          <CardHeader className="flex items-center gap-2">
            {card.icon && (
              <card.icon
                className={cn(
                  "h-4 w-4",
                  card.variant === "success"
                    ? "text-green-700"
                    : card.variant === "destructive"
                    ? "text-red-700"
                    : card.variant === "warning"
                    ? "text-amber-600"
                    : "text-muted-foreground",
                )}
              />
            )}
            <CardTitle className="text-base">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-sm mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
