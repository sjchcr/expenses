import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Expense, ExpenseTemplate, UserSettings } from "@/types";
import { useMobile } from "@/hooks/useMobile";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenses: Expense[] | undefined;
  templates: ExpenseTemplate[] | undefined;
  settings: UserSettings | undefined;
}

export function ExportDialog({
  open,
  onOpenChange,
  expenses,
  templates,
  settings,
}: ExportDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!expenses || expenses.length === 0) {
      toast.error(t("settings.noExpensesToExport"));
      return;
    }

    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === "csv") {
        const headers = [
          "Name",
          "Due Date",
          "Is Paid",
          "Payment Period",
          "Currencies",
          "Amounts",
          "Created At",
        ];
        const rows = expenses.map((e) => [
          e.name,
          e.due_date,
          e.is_paid ? "Yes" : "No",
          e.payment_period,
          e.amounts.map((a) => a.currency).join("; "),
          e.amounts.map((a) => `${a.currency}: ${a.amount}`).join("; "),
          e.created_at || "",
        ]);

        content = [
          headers.join(","),
          ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
        ].join("\n");
        filename = `expenses-export-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      } else {
        const exportData = {
          exportDate: new Date().toISOString(),
          settings: settings,
          expenses: expenses,
          templates: templates || [],
        };
        content = JSON.stringify(exportData, null, 2);
        filename = `expenses-export-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      }

      if (Capacitor.isNativePlatform()) {
        // Native iOS/Android: Write file and share
        const result = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
        });

        await Share.share({
          title: t("settings.exportData"),
          url: result.uri,
        });
      } else {
        // Web: Download via blob
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success(
        t("settings.exported", {
          count: expenses.length,
          format: exportFormat.toUpperCase(),
        }),
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(t("settings.exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" submitOnTop={isMobile}>
        <DialogHeader>
          <DialogTitle>{t("settings.exportData")}</DialogTitle>
          <DialogDescription>{t("settings.exportDataDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("settings.exportFormat")}</Label>
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as "csv" | "json")}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">{t("settings.csvFormat")}</SelectItem>
                <SelectItem value="json">{t("settings.jsonFormat")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1 pl-3">
              {exportFormat === "csv"
                ? t("settings.csvHint")
                : t("settings.jsonHint")}
            </p>
          </div>
        </div>
        {isMobile ? (
          <Button
            size="icon"
            onClick={handleExport}
            disabled={isExporting}
            className="absolute top-4 right-4"
          >
            <Download />
          </Button>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4" />
              {isExporting ? t("common.exporting") : t("settings.download")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
