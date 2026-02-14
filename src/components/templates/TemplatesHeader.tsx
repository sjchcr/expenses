import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/useMobile";

export function TemplatesHeader() {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col justify-start items-start gap-1">
        {!isMobile && (
          <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
            {t("templates.title")}
          </h2>
        )}
        <div className="text-sm text-gray-600">
          {t("templates.description")}
        </div>
      </div>
    </div>
  );
}
