import { useTranslation } from "react-i18next";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMobile } from "@/hooks/useMobile";

interface SalaryHeaderProps {
  onAdd: () => void;
}

export function SalaryHeader({ onAdd }: SalaryHeaderProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col justify-start items-start gap-1">
        {!isMobile && (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" disabled>
              <Link to="/aguinaldo">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-accent-foreground">
              {t("salary.title")}
            </h1>
          </div>
        )}
        <div className="text-sm text-gray-600">{t("salary.description")}</div>
      </div>
      {!isMobile && (
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {t("salary.addSalary")}
        </Button>
      )}
    </div>
  );
}
