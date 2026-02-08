import { useTranslation } from "react-i18next";
import { CircleOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpensesEmptyStateProps {
  onAddExpense: () => void;
}

export function ExpensesEmptyState({ onAddExpense }: ExpensesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <p className="flex flex-col justify-center items-center gap-2 text-gray-500 mb-4">
        <CircleOff className="h-6 w-6" />
        {t("expenses.noExpenses")}
      </p>
      <Button onClick={onAddExpense}>
        <Plus className="h-4 w-4" />
        {t("expenses.addFirstExpense")}
      </Button>
    </div>
  );
}
