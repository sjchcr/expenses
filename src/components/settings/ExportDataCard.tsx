import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExportDataCardProps {
  expensesCount: number;
  templatesCount: number;
  onExportClick: () => void;
}

export function ExportDataCard({
  expensesCount,
  templatesCount,
  onExportClick,
}: ExportDataCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t("settings.exportData")}
        </CardTitle>
        <CardDescription>{t("settings.exportDataDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>{t("settings.yourDataIncludes")}</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>{t("settings.expensesCount", { count: expensesCount })}</li>
            <li>{t("settings.templatesCount", { count: templatesCount })}</li>
            <li>{t("settings.yourSettings")}</li>
          </ul>
        </div>
        <Button className="w-full sm:w-auto" onClick={onExportClick}>
          <Download className="h-4 w-4" />
          {t("settings.exportData")}
        </Button>
      </CardContent>
    </Card>
  );
}
