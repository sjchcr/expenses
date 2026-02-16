import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";
import { useStockPeriods, useStocksSettings } from "@/hooks/useStocks";
import { useMobile } from "@/hooks/useMobile";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { Button } from "@/components/ui/button";
import {
  StockPeriodDialog,
  StocksSettingsDialog,
  StocksSummaryCards,
  StockPeriodsTable,
} from "@/components/stocks";
import { calcYearTotals } from "@/lib/stockCalculations";
import type { StockPeriod } from "@/types";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";

export default function Stocks() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<StockPeriod | null>(null);

  const {
    data: periods,
    isLoading: periodsLoading,
    refetch,
  } = useStockPeriods(selectedYear);
  const { data: settings, isLoading: settingsLoading } = useStocksSettings();

  const isLoading = periodsLoading || settingsLoading;

  const totals = useMemo(() => {
    return calcYearTotals(periods || [], settings);
  }, [periods, settings]);

  const handlePrevYear = useCallback(() => {
    setSelectedYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setSelectedYear((y) => y + 1);
  }, []);

  const handleAddPeriod = useCallback(() => {
    setEditingPeriod(null);
    setPeriodDialogOpen(true);
  }, []);

  const handleEditPeriod = useCallback((period: StockPeriod) => {
    setEditingPeriod(period);
    setPeriodDialogOpen(true);
  }, []);

  const handlePeriodDialogClose = useCallback((open: boolean) => {
    setPeriodDialogOpen(open);
    if (!open) {
      setEditingPeriod(null);
    }
  }, []);

  const buttons: HeaderActionsGroups[] = [
    {
      group: "menuActions",
      type: "button",
      actions: [
        {
          label: t("stocks.settings"),
          icon: Settings,
          onClick: () => setSettingsDialogOpen(true),
        },
        {
          label: t("stocks.addPeriod"),
          icon: Plus,
          onClick: handleAddPeriod,
        },
      ],
    },
  ];

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center gap-2">
        <div className="flex flex-col justify-start items-start gap-1">
          {!isMobile && (
            <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              {t("stocks.title")}
            </h2>
          )}
          <div className="text-sm text-gray-600">{t("stocks.description")}</div>
        </div>
        {!isMobile && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
              {t("stocks.settings")}
            </Button>
            <Button onClick={handleAddPeriod}>
              <Plus className="h-4 w-4" />
              {t("stocks.addPeriod")}
            </Button>
          </div>
        )}
      </div>

      {/* Year Controls and Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="col-span-1 flex flex-col gap-1">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            {t("common.year")}
          </Label>
          <ButtonGroup className="w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevYear}
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <ButtonGroupText className="w-[calc(100%-4.5rem)] justify-center bg-background text-sm">
              {selectedYear}
            </ButtonGroupText>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextYear}
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Summary Cards */}
      <StocksSummaryCards totals={totals} isLoading={isLoading} />

      {/* Periods Table */}
      <StockPeriodsTable
        periods={periods || []}
        settings={settings ?? null}
        isLoading={isLoading}
        onEdit={handleEditPeriod}
      />

      {/* Dialogs */}
      <StockPeriodDialog
        open={periodDialogOpen}
        onOpenChange={handlePeriodDialogClose}
        period={editingPeriod}
        defaultYear={selectedYear}
      />

      <StocksSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader actions={buttons} title={t("stocks.title")} hasAvatar />
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
    </div>
  );
}
