import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Salary } from "@/types";
import { SalaryInput } from "./SalaryInput";
import { formatCurrency, type AguinaldoMonth } from "./utils";
import { Label } from "../ui/label";

interface SalaryTableProps {
  aguinaldoYear: number;
  aguinaldoMonths: AguinaldoMonth[];
  currency: string;
  isLoading: boolean;
  savingKey: string | null;
  getSalary: (
    year: number,
    month: number,
    paymentNumber: number,
  ) => Salary | undefined;
  monthlyTotals: Record<string, number>;
  onSave: (
    year: number,
    month: number,
    paymentNumber: number,
    amount: number,
  ) => void;
}

export function SalaryTable({
  aguinaldoYear,
  aguinaldoMonths,
  currency,
  isLoading,
  savingKey,
  getSalary,
  monthlyTotals,
  onSave,
}: SalaryTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-accent shadow-md overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden pb-0 gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("aguinaldo.salariesFor", { year: aguinaldoYear })}
        </CardTitle>
        <CardDescription>{t("aguinaldo.salariesDescription")}</CardDescription>
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
                  "w-full flex items-center justify-center gap-2 p-4 hover:bg-primary/5",
                  index !== aguinaldoMonths.length - 1 &&
                    "border-b border-gray-200 dark:border-accent",
                )}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 items-end gap-3 w-full">
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 justify-between items-start md:items-center gap-3">
                    <Label className="text-md pl-0">{label}</Label>
                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4">
                      <div className="col-span-1 w-full">
                        <Label>{t("aguinaldo.salary")} 1</Label>
                        <SalaryInput
                          year={year}
                          month={month}
                          paymentNumber={1}
                          salary={salary1}
                          onSave={onSave}
                          isSaving={isSaving1}
                        />
                      </div>
                      <div className="col-span-1 w-full">
                        <Label>{t("aguinaldo.salary")} 2</Label>
                        <SalaryInput
                          year={year}
                          month={month}
                          paymentNumber={2}
                          salary={salary2}
                          onSave={onSave}
                          isSaving={isSaving2}
                        />
                      </div>
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
        </div>
      </CardContent>
    </Card>
  );
}
