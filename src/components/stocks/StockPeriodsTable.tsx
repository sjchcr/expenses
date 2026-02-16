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
import { toast } from "sonner";
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
import { useDeleteStockPeriod } from "@/hooks/useStocks";
import type { StockPeriod, StocksSettings, StockPeriodBreakdown } from "@/types";
import {
  calcPeriodBreakdown,
  formatUsd,
  formatPercentage,
} from "@/lib/stockCalculations";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StockPeriodsTableProps {
  periods: StockPeriod[];
  settings: StocksSettings | null;
  isLoading: boolean;
  onEdit: (period: StockPeriod) => void;
}

function BreakdownContent({
  data,
  period,
  settings,
  t,
}: {
  data: StockPeriodBreakdown;
  period: StockPeriod | null;
  settings: StocksSettings | null;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Gross */}
      <div className="grid grid-cols-3 px-4">
        <span>{t("stocks.gross")}</span>
        {period && (
          <span className="text-sm font-mono text-right">
            {period.quantity} x {formatUsd(period.stock_price_usd)}
          </span>
        )}
        <span className="font-mono font-medium text-right">
          {formatUsd(data.grossUsd)}
        </span>
      </div>

      {/* US Tax */}
      <div className="grid grid-cols-3 px-4">
        <span>{t("stocks.usTax")}</span>
        {settings && (
          <span className="text-sm font-mono text-right">
            {formatPercentage(settings.us_tax_percentage)}
          </span>
        )}
        <span className="font-mono text-right text-red-500">
          -{formatUsd(data.usTaxUsd)}
        </span>
      </div>

      {/* After US taxes subtotal */}
      <Separator />
      <div className="grid grid-cols-3 px-4 font-semibold">
        <span className="col-span-2">{t("stocks.afterUsTax")}</span>
        <span className="font-mono text-right">
          {formatUsd(data.afterUsTaxUsd)}
        </span>
      </div>
      <Separator />

      {/* Broker cost */}
      <div className="grid grid-cols-3 px-4">
        <span>{t("stocks.brokerCost")}</span>
        {settings && (
          <span className="text-sm font-mono text-right">
            {formatUsd(settings.broker_cost_usd)}
          </span>
        )}
        <span className="font-mono text-right text-red-500">
          -{formatUsd(data.brokerCostUsd)}
        </span>
      </div>

      {/* Local tax */}
      <div className="grid grid-cols-3 px-4">
        <span>{t("stocks.localTax")}</span>
        {settings && (
          <span className="text-sm font-mono text-right">
            {formatPercentage(settings.local_tax_percentage)}
          </span>
        )}
        <span className="font-mono text-right text-red-500">
          -{formatUsd(data.localTaxUsd)}
        </span>
      </div>

      {/* Other deductions */}
      {data.otherDeductions.map((d, i) => (
        <div key={i} className="grid grid-cols-3 px-4">
          <span>{d.name}</span>
          <span className="text-sm font-mono text-right">
            {d.type === "percentage"
              ? formatPercentage(d.rate)
              : formatUsd(d.rate)}
          </span>
          <span className="font-mono text-right text-red-500">
            -{formatUsd(d.amount)}
          </span>
        </div>
      ))}

      {/* After all deductions */}
      <Separator />
      <div className="grid grid-cols-3 px-4 font-semibold">
        <span className="col-span-2">{t("stocks.afterAllDeductions")}</span>
        <span className="font-mono text-green-600 text-right">
          {formatUsd(data.netUsd)}
        </span>
      </div>

      {data.warning && (
        <div className="flex items-center gap-2 text-yellow-600 text-sm mt-2 px-4">
          <AlertTriangle className="h-4 w-4" />
          <span>{t("stocks.deductionsExceedGross")}</span>
        </div>
      )}
    </div>
  );
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
  const deleteMutation = useDeleteStockPeriod();

  const breakdownData = breakdownPeriod
    ? calcPeriodBreakdown(breakdownPeriod, settings)
    : null;

  console.log(breakdownPeriod);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success(t("stocks.periodDeleted"));
    } catch {
      toast.error(t("stocks.periodDeleteFailed"));
    } finally {
      setDeleteId(null);
    }
  };

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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          className="max-w-sm"
          showCloseButton={false}
          fromBottom={false}
        >
          <DialogHeader>
            <DialogTitle>{t("stocks.deletePeriod")}</DialogTitle>
            <DialogDescription>
              {t("stocks.deletePeriodConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full">
                {t("common.cancel")}
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              {deleteMutation.isPending
                ? t("common.deleting")
                : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Breakdown Dialog */}
      <Dialog
        open={!!breakdownPeriod}
        onOpenChange={() => setBreakdownPeriod(null)}
      >
        <DialogContent className="max-w-lg gap-2">
          <DialogHeader>
            <DialogTitle>{t("stocks.netBreakdown")}</DialogTitle>
            <DialogDescription>
              {breakdownPeriod &&
                format(parseISO(breakdownPeriod.vesting_date), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="px-0">
            {breakdownData && (
              <BreakdownContent
                data={breakdownData}
                period={breakdownPeriod}
                settings={settings}
                t={t}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
