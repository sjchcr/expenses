import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import {
  Ellipsis,
  AlertTriangle,
  Trash2,
  Calculator,
  CircleOff,
  SquarePen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DeleteStockPeriodDialog } from "./DeleteStockPeriodDialog";
import { StockBreakdownDialog } from "./StockBreakdownDialog";
import type { StockPeriod, StocksSettings } from "@/types";
import { calcPeriodBreakdown, formatUsd } from "@/lib/stockCalculations";
import { cn } from "@/lib/utils";

interface StockPeriodsTableProps {
  periods: StockPeriod[];
  settings: StocksSettings | null;
  isLoading: boolean;
  onEdit: (period: StockPeriod) => void;
}

export function StockPeriodsTable({
  periods,
  settings,
  isLoading,
  onEdit,
}: StockPeriodsTableProps) {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [breakdownPeriod, setBreakdownPeriod] = useState<StockPeriod | null>(
    null,
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-1/2" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-2 p-6 text-sm text-gray-500">
        <CircleOff className="h-6 w-6" />
        {t("stocks.noPeriods")}
      </div>
    );
  }

  return (
    <>
      <Card className="gap-0" variant="defaultGradient">
        <CardHeader>
          <CardTitle>{t("stocks.vestingPeriods")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">
                    {t("stocks.vestingDate")}
                  </TableHead>
                  <TableHead className="text-right px-4">
                    {t("stocks.quantity")}
                  </TableHead>
                  <TableHead className="text-right px-4">
                    {t("stocks.price")}
                  </TableHead>
                  <TableHead className="text-right px-4">
                    {t("stocks.gross")}
                  </TableHead>
                  <TableHead className="text-right px-4">
                    {t("stocks.net")}
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => {
                  const breakdown = calcPeriodBreakdown(period, settings);
                  const vestingDate = period.vesting_date;
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  const isPast = vestingDate < todayStr;
                  const isToday = vestingDate === todayStr;
                  return (
                    <TableRow
                      key={period.id}
                      className={cn(
                        isToday
                          ? "bg-amber-500/10 text-amber-500"
                          : isPast && "bg-green-600/10 text-green-600",
                      )}
                    >
                      <TableCell className="font-medium px-4">
                        <div className="flex items-center gap-2">
                          {format(parseISO(vestingDate), "MMM d, yyyy")}
                          {breakdown.warning && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        {period.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-50">
                            {period.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono px-4">
                        {period.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono px-4">
                        {formatUsd(period.stock_price_usd)}
                      </TableCell>
                      <TableCell className="text-right font-mono px-4">
                        {formatUsd(breakdown.grossUsd)}
                      </TableCell>
                      <TableCell className="text-right font-mono px-4">
                        {formatUsd(breakdown.netUsd)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setBreakdownPeriod(period)}
                            >
                              <Calculator />
                              {t("stocks.viewBreakdown")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(period)}>
                              <SquarePen />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteId(period.id)}
                            >
                              <Trash2 />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteStockPeriodDialog
        periodId={deleteId}
        onClose={() => setDeleteId(null)}
      />

      <StockBreakdownDialog
        period={breakdownPeriod}
        settings={settings}
        onClose={() => setBreakdownPeriod(null)}
      />
    </>
  );
}
