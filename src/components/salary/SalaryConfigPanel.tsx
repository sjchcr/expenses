import { useTranslation } from "react-i18next";
import { Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SalaryRecord, SalarySettings } from "@/types";
import {
  calcSalaryBreakdown,
  formatCurrency,
  formatPercentage,
} from "@/lib/salaryCalculations";

interface SalaryConfigPanelProps {
  record: SalaryRecord;
  settings: SalarySettings | null;
  onOpenSettings: () => void;
}

export function SalaryConfigPanel({
  record,
  settings,
  onOpenSettings,
}: SalaryConfigPanelProps) {
  const { t } = useTranslation();
  const breakdown = calcSalaryBreakdown(record, settings);
  const activeDeductions = breakdown.deductions;

  return (
    <Card variant="defaultGradient" className="gap-0">
      <CardHeader className="pb-3">
        <CardTitle>{t("salary.deductions")}</CardTitle>
        <CardDescription>{t("salary.deductionsDescription")}</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title={t("salary.settings")}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {activeDeductions.length === 0 ? (
          <p className="text-xs text-muted-foreground px-4 py-3">—</p>
        ) : (
          activeDeductions.map((d, i) => (
            <div
              key={d.id}
              className={`flex justify-between items-center px-4 py-2.5 text-sm ${
                i < activeDeductions.length - 1 ? "border-b border-dashed" : ""
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{d.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {d.type === "percentage"
                    ? formatPercentage(d.rate)
                    : formatCurrency(d.rate, record.currency)}
                </span>
              </div>
              <span className="font-mono text-sm text-red-500">
                -{formatCurrency(d.monthlyAmount, record.currency)}
              </span>
            </div>
          ))
        )}
        {/* Rent tax total if applicable */}
        {breakdown.rentTax.appliedToCrc &&
          breakdown.rentTax.monthlyTotal > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span className="font-medium">{t("salary.rentTax")}</span>
                <span className="font-mono text-sm text-red-500">
                  -
                  {formatCurrency(
                    breakdown.rentTax.monthlyTotal,
                    record.currency,
                  )}
                </span>
              </div>
            </>
          )}
      </CardContent>
    </Card>
  );
}
