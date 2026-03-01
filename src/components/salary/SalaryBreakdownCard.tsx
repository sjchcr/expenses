import { useTranslation } from "react-i18next";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SalaryRecord, SalarySettings, SalaryBreakdown } from "@/types";
import {
  calcSalaryBreakdown,
  formatCurrency,
  formatPercentage,
  formatCRC,
  formatUsd,
} from "@/lib/salaryCalculations";
import { Button } from "../ui/button";
import { Edit, X } from "lucide-react";

interface SalaryBreakdownCardProps {
  record: SalaryRecord;
  settings: SalarySettings | null;
  exchangeRate?: number | null;
  onEdit: () => void;
  onDelete: () => void;
}

function AmountCell({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={`font-mono text-right tabular-nums ${className ?? ""}`}>
      {value}
    </span>
  );
}

export function SalaryBreakdownCard({
  record,
  settings,
  exchangeRate,
  onEdit,
  onDelete,
}: SalaryBreakdownCardProps) {
  const { t } = useTranslation();
  const breakdown: SalaryBreakdown = calcSalaryBreakdown(
    record,
    settings,
    exchangeRate,
  );

  const fmt = (amount: number) => formatCurrency(amount, breakdown.currency);
  const fmtConverted = (amount: number) =>
    breakdown.convertedCurrency === "USD"
      ? formatUsd(amount)
      : formatCRC(amount);

  return (
    <Card variant="defaultGradient" className="gap-0">
      <CardHeader className="pb-3">
        <CardTitle>{record.label}</CardTitle>
        <CardDescription>
          {t("salary.salaryBreakdownDescription")}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title={t("salary.settings")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghostDestructive"
            size="icon"
            onClick={onDelete}
            title={t("salary.settings")}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <span className="col-span-2" />
        <span className="text-right">{t("salary.monthly")}</span>
        <span className="text-right">{t("salary.fortnightly")}</span>
      </div>

      <Separator />
      <CardContent className="px-0 pb-4">
        {/* Gross */}
        <div className="grid grid-cols-4 px-6 py-2 font-medium">
          <span className="col-span-2">{t("salary.grossSalary")}</span>
          <AmountCell value={fmt(breakdown.grossMonthly)} />
          <AmountCell value={fmt(breakdown.grossFortnightly)} />
        </div>

        {/* Active deductions */}
        {breakdown.deductions.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="px-6 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("salary.deductions")}
            </div>
            {breakdown.deductions.map((d) => (
              <div key={d.id} className="grid grid-cols-4 px-6 py-1.5 text-sm">
                <span className="col-span-2 flex gap-2 items-center">
                  {d.name}
                  <span className="text-xs text-muted-foreground font-mono">
                    {d.type === "percentage"
                      ? formatPercentage(d.rate)
                      : fmt(d.rate)}
                  </span>
                </span>
                <AmountCell
                  value={`-${fmt(d.monthlyAmount)}`}
                  className="text-red-500"
                />
                <AmountCell
                  value={`-${fmt(d.fortnightlyAmount)}`}
                  className="text-red-500"
                />
              </div>
            ))}
          </>
        )}

        {/* Rent tax brackets (only if CRC) */}
        {breakdown.rentTax.appliedToCrc &&
          breakdown.rentTax.brackets.length > 0 && (
            <>
              <Separator className="my-1" />
              <div className="px-6 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("salary.rentTax")}
              </div>
              {breakdown.rentTax.brackets.map((b, i) => (
                <div key={i} className="grid grid-cols-4 px-6 py-1.5 text-sm">
                  <span className="col-span-2 flex gap-2 items-center">
                    {b.label}
                    {b.rate > 0 && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatPercentage(b.rate)}
                      </span>
                    )}
                  </span>
                  <AmountCell
                    value={b.rate > 0 ? `-${fmt(b.monthlyAmount)}` : "—"}
                    className={
                      b.rate > 0 ? "text-red-500" : "text-muted-foreground"
                    }
                  />
                  <AmountCell
                    value={b.rate > 0 ? `-${fmt(b.fortnightlyAmount)}` : "—"}
                    className={
                      b.rate > 0 ? "text-red-500" : "text-muted-foreground"
                    }
                  />
                </div>
              ))}
            </>
          )}

        {/* Total deductions */}
        <Separator className="my-2" />
        <div className="grid grid-cols-4 px-6 py-2 font-semibold text-sm">
          <span className="col-span-2">{t("salary.totalDeductions")}</span>
          <AmountCell
            value={`-${fmt(breakdown.totalDeductionsMonthly)}`}
            className="text-red-500"
          />
          <AmountCell
            value={`-${fmt(breakdown.totalDeductionsFortnightly)}`}
            className="text-red-500"
          />
        </div>

        {/* Net salary */}
        <Separator className="my-2" />
        <div className="grid grid-cols-4 px-6 py-2 font-bold">
          <span className="col-span-2">{t("salary.netSalary")}</span>
          <AmountCell
            value={fmt(breakdown.netMonthly)}
            className="text-green-600"
          />
          <AmountCell
            value={fmt(breakdown.netFortnightly)}
            className="text-green-600"
          />
        </div>

        {/* Converted currency row */}
        {breakdown.convertedCurrency &&
          breakdown.netMonthlyConverted !== null &&
          breakdown.netFortnightlyConverted !== null && (
            <div className="grid grid-cols-4 px-6 py-1.5 text-sm text-muted-foreground">
              <span className="col-span-2">
                ≈ {breakdown.convertedCurrency}
              </span>
              <AmountCell value={fmtConverted(breakdown.netMonthlyConverted)} />
              <AmountCell
                value={fmtConverted(breakdown.netFortnightlyConverted)}
              />
            </div>
          )}
        {!breakdown.convertedCurrency && (
          <div className="px-6 py-1.5 text-xs text-muted-foreground">
            {t("salary.exchangeRateUnavailable")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
