import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalaryHeaderProps {
  onAdd: () => void;
}

export function SalaryHeader({ onAdd }: SalaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-accent-foreground">
          {t("salary.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("salary.description")}
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {t("salary.addSalary")}
      </Button>
    </div>
  );
}
