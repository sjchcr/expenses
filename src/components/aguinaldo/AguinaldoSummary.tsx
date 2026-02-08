import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "./utils";

interface AguinaldoSummaryProps {
  grandTotal: number;
  aguinaldo: number;
  currency: string;
}

export function AguinaldoSummary({
  grandTotal,
  aguinaldo,
  currency,
}: AguinaldoSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-blue-800/10 dark:bg-blue-800/20 px-4 py-2 text-blue-800 dark:text-blue-300">
          <p className="col-span-1 md:col-span-3">
            {t("aguinaldo.totalAnnualSalary")}
          </p>
          <p className="col-span-1 text-right font-bold">
            {formatCurrency(grandTotal, currency)}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 px-4 py-2 text-xl bg-green-500/10 dark:bg-green-600/20 text-green-600 dark:text-green-400">
          <p className="col-span-1 md:col-span-3 font-bold">
            {t("aguinaldo.title")}
          </p>
          <p className="col-span-1 text-right font-bold">
            {formatCurrency(aguinaldo, currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
