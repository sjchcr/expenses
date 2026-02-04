import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSalaries, useUpsertSalary } from "@/hooks/useSalaries";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Salary } from "@/types";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";

const CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP"];

// For aguinaldo year X, we need Dec of X-1 and Jan-Nov of X
// Display order: Dec (prev year), Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov
const getAguinaldoMonths = (aguinaldoYear: number, t: TFunction) => [
  {
    year: aguinaldoYear - 1,
    month: 12,
    label: `${t("months.december")} ${aguinaldoYear - 1}`,
  },
  { year: aguinaldoYear, month: 1, label: t("months.january") },
  { year: aguinaldoYear, month: 2, label: t("months.february") },
  { year: aguinaldoYear, month: 3, label: t("months.march") },
  { year: aguinaldoYear, month: 4, label: t("months.april") },
  { year: aguinaldoYear, month: 5, label: t("months.may") },
  { year: aguinaldoYear, month: 6, label: t("months.june") },
  { year: aguinaldoYear, month: 7, label: t("months.july") },
  { year: aguinaldoYear, month: 8, label: t("months.august") },
  { year: aguinaldoYear, month: 9, label: t("months.september") },
  { year: aguinaldoYear, month: 10, label: t("months.october") },
  { year: aguinaldoYear, month: 11, label: t("months.november") },
];

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface SalaryInputProps {
  year: number;
  month: number;
  paymentNumber: 1 | 2;
  salary?: Salary;
  currency: string;
  onSave: (
    year: number,
    month: number,
    paymentNumber: number,
    amount: number,
  ) => void;
  isSaving: boolean;
}

function SalaryInput({
  year,
  month,
  paymentNumber,
  salary,
  onSave,
  isSaving,
}: SalaryInputProps) {
  const [localValue, setLocalValue] = useState<string>(
    salary?.gross_amount?.toString() || "",
  );
  const [isDirty, setIsDirty] = useState(false);

  const handleBlur = () => {
    if (isDirty) {
      const amount = parseFloat(localValue) || 0;
      onSave(year, month, paymentNumber, amount);
      setIsDirty(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative">
      <Input
        type="number"
        step="0.01"
        min="0"
        width="100%"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="0.00"
        className="text-right pr-8"
        disabled={isSaving}
      />
      {isSaving && (
        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

export default function Aguinaldo() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [aguinaldoYear, setAguinaldoYear] = useState(currentYear);
  const [currency, setCurrency] = useState("CRC");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { data: salaries, isLoading } = useSalaries(aguinaldoYear);
  const upsertMutation = useUpsertSalary();

  const aguinaldoMonths = useMemo(
    () => getAguinaldoMonths(aguinaldoYear, t),
    [aguinaldoYear, t],
  );

  // Create a lookup map for salaries
  const salaryMap = useMemo(() => {
    const map = new Map<string, Salary>();
    salaries?.forEach((s) => {
      const key = `${s.year}-${s.month}-${s.payment_number}`;
      map.set(key, s);
    });
    return map;
  }, [salaries]);

  const getSalary = (year: number, month: number, paymentNumber: number) => {
    return salaryMap.get(`${year}-${month}-${paymentNumber}`);
  };

  const handleSave = useCallback(
    async (
      year: number,
      month: number,
      paymentNumber: number,
      amount: number,
    ) => {
      const key = `${year}-${month}-${paymentNumber}`;
      setSavingKey(key);
      try {
        await upsertMutation.mutateAsync({
          year,
          month,
          payment_number: paymentNumber,
          gross_amount: amount,
          currency,
        });
        toast.success(t("aguinaldo.salarySaved"));
      } catch {
        toast.error(t("aguinaldo.salaryFailed"));
      } finally {
        setSavingKey(null);
      }
    },
    [currency, upsertMutation],
  );

  // Calculate totals
  const { monthlyTotals, grandTotal, aguinaldo } = useMemo(() => {
    const totals: Record<string, number> = {};
    let total = 0;

    aguinaldoMonths.forEach(({ year, month }) => {
      const key = `${year}-${month}`;
      const payment1 = getSalary(year, month, 1)?.gross_amount || 0;
      const payment2 = getSalary(year, month, 2)?.gross_amount || 0;
      const monthTotal = payment1 + payment2;
      totals[key] = monthTotal;
      total += monthTotal;
    });

    return {
      monthlyTotals: totals,
      grandTotal: total,
      aguinaldo: total / 12,
    };
  }, [aguinaldoMonths, salaryMap]);

  const handlePrevYear = () => setAguinaldoYear((y) => y - 1);
  const handleNextYear = () => setAguinaldoYear((y) => y + 1);

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            {!isMobile && (
              <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
                {t("aguinaldo.title")} {aguinaldoYear}
              </h2>
            )}
            <div className="text-sm text-gray-600">
              {t("aguinaldo.description")}{" "}
              <span className="font-mono bg-accent text-xs p-1 rounded-sm">
                {t("aguinaldo.formula")}
              </span>
              .
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("aguinaldo.aguinaldoYear")}
            </label>
            <ButtonGroup className="w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevYear}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <ButtonGroupText className="w-[calc(100%-4.5rem)] justify-center bg-background text-sm shadow-sm">
                {aguinaldoYear}
              </ButtonGroupText>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextYear}
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.currency")}
            </label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salary Table */}
        {isLoading ? (
          <Card className="border border-gray-200 dark:border-accent shadow-md rounded-xl overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md rounded-xl overflow-hidden pb-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t("aguinaldo.salariesFor", { year: aguinaldoYear })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {aguinaldoMonths.map(({ year, month, label }, index) => {
                  const monthKey = `${year}-${month}`;
                  const monthTotal = monthlyTotals[monthKey] || 0;
                  const salary1 = getSalary(year, month, 1);
                  const salary2 = getSalary(year, month, 2);
                  const isSaving1 = savingKey === `${year}-${month}-1`;
                  const isSaving2 = savingKey === `${year}-${month}-2`;

                  return (
                    <div
                      key={monthKey}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 hover:bg-primary/5",
                        index !== aguinaldoMonths.length - 1 &&
                          "border-b border-gray-200 dark:border-accent",
                      )}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-3 w-full">
                        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 justify-between items-start md:items-center gap-3">
                          <div className="col-span-1">{label}</div>
                          <div className="col-span-1">
                            <SalaryInput
                              year={year}
                              month={month}
                              paymentNumber={1}
                              salary={salary1}
                              currency={currency}
                              onSave={handleSave}
                              isSaving={isSaving1}
                            />
                          </div>
                          <div className="col-span-1">
                            <SalaryInput
                              year={year}
                              month={month}
                              paymentNumber={2}
                              salary={salary2}
                              currency={currency}
                              onSave={handleSave}
                              isSaving={isSaving2}
                            />
                          </div>
                        </div>
                        <p
                          className={cn(
                            "font-bold col-span-1 text-right",
                            salary1 && salary2
                              ? "text-green-600 dark:text-green-400"
                              : (!salary1 || salary1.gross_amount == 0) &&
                                (!salary2 || salary2.gross_amount == 0)
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400",
                          )}
                        >
                          {formatCurrency(monthTotal, currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="grid grid-cols-2 md:grid-cols-4 border-t-2 border-gray-200 dark:border-accent bg-blue-800/10 dark:bg-blue-800/20 px-4 py-2 text-blue-800 dark:text-blue-300">
                  <p className="col-span-1 md:col-span-3 text-right">
                    {t("aguinaldo.totalAnnualSalary")}
                  </p>
                  <p className="col-span-1 text-right font-bold">
                    {formatCurrency(grandTotal, currency)}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 px-4 py-2 text-xl bg-green-500/10 dark:bg-green-600/20 text-green-600 dark:text-green-400">
                  <p className="col-span-1 md:col-span-3 text-right">
                    {t("aguinaldo.title")}
                  </p>
                  <p className="col-span-1 text-right font-bold">
                    {formatCurrency(aguinaldo, currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
