import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/useMobile";
import type {
  StockPeriod,
  StocksSettings,
  StockPeriodBreakdown,
} from "@/types";
import {
  calcPeriodBreakdown,
  formatUsd,
  formatPercentage,
} from "@/lib/stockCalculations";

function BreakdownContent({
  data,
  period,
  settings,
  showHeader = false,
  t,
}: {
  data: StockPeriodBreakdown;
  period: StockPeriod | null;
  settings: StocksSettings | null;
  showHeader?: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-background dark:bg-accent/50 shadow-md inset-shadow-sm zigzag-border">
      {/* Receipt header (only shown in exported PNG) */}
      {showHeader && period && (
        <>
          <div className="flex flex-col items-start gap-0.5 px-4 pt-2 pb-1">
            <span className="text-lg font-semibold">
              {t("stocks.breakdownReceiptTitle")}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(period.vesting_date), "MMMM d, yyyy")}
            </span>
          </div>
          <Separator />
        </>
      )}
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

      {/* After US taxes subtotal */}
      <Separator />
      <div className="grid grid-cols-3 px-4 font-semibold">
        <span className="col-span-2">{t("stocks.afterUsTax")}</span>
        <span className="font-mono text-right">
          {formatUsd(data.afterUsTaxUsd)}
        </span>
      </div>
      <Separator />

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

interface StockBreakdownDialogProps {
  period: StockPeriod | null;
  settings: StocksSettings | null;
  onClose: () => void;
}

export function StockBreakdownDialog({
  period,
  settings,
  onClose,
}: StockBreakdownDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const breakdownRef = useRef<HTMLDivElement>(null);
  const [showHeader, setShowHeader] = useState(false);
  const breakdownData = period ? calcPeriodBreakdown(period, settings) : null;

  const handleDownloadBreakdown = useCallback(async () => {
    if (!breakdownRef.current || !period) return;
    try {
      setShowHeader(true);
      // Wait for React to render the header
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      const dataUrl = await toPng(breakdownRef.current, { pixelRatio: 3 });
      setShowHeader(false);
      const link = document.createElement("a");
      link.download = `breakdown-${period.vesting_date}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t("stocks.downloadSuccess"));
    } catch {
      setShowHeader(false);
      toast.error(t("stocks.downloadFailed"));
    }
  }, [period, t]);

  return (
    <Dialog open={!!period} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg gap-2" submitOnTop={isMobile}>
        <DialogHeader>
          <DialogTitle>{t("stocks.netBreakdown")}</DialogTitle>
          <DialogDescription>
            {period && format(parseISO(period.vesting_date), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="px-0">
          {breakdownData && (
            <div ref={breakdownRef}>
              <BreakdownContent
                data={breakdownData}
                period={period}
                settings={settings}
                showHeader={showHeader}
                t={t}
              />
            </div>
          )}
        </DialogBody>
        {isMobile ? (
          <Button
            onClick={handleDownloadBreakdown}
            size="icon"
            className="absolute top-4 right-4"
          >
            <Download />
          </Button>
        ) : (
          <DialogFooter className="border-t">
            <Button
              type="button"
              className="w-full"
              onClick={handleDownloadBreakdown}
            >
              <Download className="h-4 w-4" />
              {t("stocks.downloadBreakdown")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
