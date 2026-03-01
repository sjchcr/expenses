import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CircleOff, Plus } from "lucide-react";
import { useSalaryRecords, useSalarySettings } from "@/hooks/useSalary";
import { useExchangeRates, getExchangeRate } from "@/hooks/useExchangeRates";
import { useMobile } from "@/hooks/useMobile";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import {
  SalaryHeader,
  SalaryLoadingSkeleton,
  SalaryBreakdownCard,
  SalaryConfigPanel,
  SalaryDialog,
  DeleteSalaryDialog,
  SalarySettingsDialog,
} from "@/components/salary";
import type { SalaryRecord } from "@/types";

export default function Salary() {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const {
    data: records = [],
    isLoading: recordsLoading,
    refetch,
  } = useSalaryRecords();
  const { data: settings, isLoading: settingsLoading } = useSalarySettings();
  const isLoading = recordsLoading || settingsLoading;

  // Records are ordered by effective_date descending (most recent first)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRecord: SalaryRecord | null = records[selectedIndex] ?? null;

  // Exchange rates for CRC ↔ USD
  const currencies = selectedRecord
    ? selectedRecord.currency === "CRC"
      ? ["CRC", "USD"]
      : ["USD", "CRC"]
    : ["CRC", "USD"];
  const { data: exchangeRates } = useExchangeRates(currencies);
  const exchangeRate = selectedRecord
    ? getExchangeRate(
        exchangeRates,
        selectedRecord.currency,
        selectedRecord.currency === "CRC" ? "USD" : "CRC",
      )
    : null;

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((record: SalaryRecord) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingRecord(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((i) => Math.min(i + 1, records.length - 1));
  }, [records.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((i) => Math.max(i - 1, 0));
  }, []);

  const mobileButtons: HeaderActionsGroups[] = [
    {
      group: "menuActions",
      type: "button",
      actions: [
        {
          label: t("salary.addSalary"),
          icon: Plus,
          onClick: handleAdd,
        },
      ],
    },
  ];

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      {/* Header */}
      {!isMobile && <SalaryHeader onAdd={handleAdd} />}

      {/* Navigation */}
      {records.length > 0 && (
        <div className="flex items-center gap-3">
          <ButtonGroup className="w-full max-w-sm">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={selectedIndex >= records.length - 1}
              aria-label="Previous salary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select
              value={selectedIndex.toString()}
              onValueChange={(v) => setSelectedIndex(parseInt(v, 10))}
            >
              <SelectTrigger className="flex-1 rounded-none border-x-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {records.map((r, i) => (
                  <SelectItem key={r.id} value={i.toString()}>
                    {r.label} — {format(parseISO(r.effective_date), "MMM yyyy")}
                    {i === 0 ? ` (${t("salary.currentSalary")})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={selectedIndex <= 0}
              aria-label="Next salary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Main content */}
      {isLoading ? (
        <SalaryLoadingSkeleton />
      ) : records.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-12 text-sm text-gray-500">
          <CircleOff className="h-6 w-6" />
          <p className="text-center max-w-xs">{t("salary.noSalaries")}</p>
          <Button onClick={handleAdd} className="mt-2">
            <Plus className="h-4 w-4" />
            {t("salary.addSalary")}
          </Button>
        </div>
      ) : selectedRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SalaryBreakdownCard
              record={selectedRecord}
              settings={settings ?? null}
              exchangeRate={exchangeRate}
              onEdit={() => handleEdit(selectedRecord)}
              onDelete={() => setDeleteId(selectedRecord.id)}
            />
          </div>
          <div className="lg:col-span-1">
            <SalaryConfigPanel
              record={selectedRecord}
              settings={settings ?? null}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader
          backLocation="/aguinaldo"
          title={t("salary.title")}
          actions={mobileButtons}
          hasAvatar={true}
        />
      )}

      {isMobile ? (
        <PullToRefresh
          onRefresh={async () => {
            await refetch();
          }}
        >
          {content}
        </PullToRefresh>
      ) : (
        content
      )}

      <SalaryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        record={editingRecord}
        settings={settings ?? null}
        previousRecord={editingRecord ? null : records[0] ?? null}
      />

      <DeleteSalaryDialog
        recordId={deleteId}
        onClose={() => setDeleteId(null)}
      />

      <SalarySettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
