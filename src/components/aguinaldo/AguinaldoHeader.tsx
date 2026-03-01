import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { BanknoteArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

export function AguinaldoHeader() {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col justify-start items-start gap-1">
        {!isMobile && (
          <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
            {t("aguinaldo.title")}
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
      <Button asChild>
        <Link to="/salary" className="flex items-center gap-1">
          <BanknoteArrowUp className="h-4 w-4" />
          {t("aguinaldo.seeSalary")}
        </Link>
      </Button>
    </div>
  );
}
