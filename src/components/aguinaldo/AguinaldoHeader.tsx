import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/useMobile";

interface AguinaldoHeaderProps {
  aguinaldoYear: number;
}

export function AguinaldoHeader({ aguinaldoYear }: AguinaldoHeaderProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
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
  );
}
