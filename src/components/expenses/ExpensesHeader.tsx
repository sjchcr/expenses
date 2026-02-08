import { useTranslation } from "react-i18next";
import { Plus, LayersPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";

interface ExpensesHeaderProps {
  hasGroups: boolean;
  onAddExpense: () => void;
  onFromGroup: () => void;
}

export function ExpensesHeader({
  hasGroups,
  onAddExpense,
  onFromGroup,
}: ExpensesHeaderProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <div className="flex justify-between items-start sm:items-center gap-2">
      <div className="flex flex-col justify-start items-start gap-1">
        {!isMobile && (
          <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
            {t("expenses.title")}
          </h2>
        )}
        <div className="text-sm text-gray-600">{t("expenses.description")}</div>
      </div>
      {!isMobile && (
        <div className="flex flex-col sm:flex-row gap-2">
          {hasGroups && (
            <Button variant="outline" onClick={onFromGroup}>
              <LayersPlus className="h-4 w-4" />
              {t("expenses.fromGroup")}
            </Button>
          )}
          <Button onClick={onAddExpense}>
            <Plus className="h-4 w-4" />
            {t("expenses.addExpense")}
          </Button>
        </div>
      )}
    </div>
  );
}
