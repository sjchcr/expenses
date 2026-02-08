import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useSalaries, useUpsertSalary } from "@/hooks/useSalaries";
import type { Salary } from "@/types";
import { useMobile } from "@/hooks/useMobile";
import CustomHeader from "@/components/common/CustomHeader";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import {
  AguinaldoHeader,
  AguinaldoFilters,
  SalaryTable,
  AguinaldoSummary,
  getAguinaldoMonths,
} from "@/components/aguinaldo";

export default function Aguinaldo() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [aguinaldoYear, setAguinaldoYear] = useState(currentYear);
  const [currency, setCurrency] = useState("CRC");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { data: salaries, isLoading, refetch } = useSalaries(aguinaldoYear);
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

  const getSalary = useCallback(
    (year: number, month: number, paymentNumber: number) => {
      return salaryMap.get(`${year}-${month}-${paymentNumber}`);
    },
    [salaryMap],
  );

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
    [currency, upsertMutation, t],
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
  }, [aguinaldoMonths, getSalary]);

  const handlePrevYear = () => setAguinaldoYear((y) => y - 1);
  const handleNextYear = () => setAguinaldoYear((y) => y + 1);

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      <AguinaldoHeader aguinaldoYear={aguinaldoYear} />

      <AguinaldoFilters
        aguinaldoYear={aguinaldoYear}
        currency={currency}
        onPrevYear={handlePrevYear}
        onNextYear={handleNextYear}
        onCurrencyChange={setCurrency}
      />

      <SalaryTable
        aguinaldoYear={aguinaldoYear}
        aguinaldoMonths={aguinaldoMonths}
        currency={currency}
        isLoading={isLoading}
        savingKey={savingKey}
        getSalary={getSalary}
        monthlyTotals={monthlyTotals}
        onSave={handleSave}
      />

      <AguinaldoSummary
        grandTotal={grandTotal}
        aguinaldo={aguinaldo}
        currency={currency}
      />
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && <CustomHeader title={t("aguinaldo.title")} hasAvatar />}
      {isMobile ? (
        <PullToRefresh
          onRefresh={async () => {
            await refetch();
          }}
        >
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </div>
  );
}
