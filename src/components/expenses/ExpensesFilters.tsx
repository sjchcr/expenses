import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MONTH_KEYS } from "./constants";

interface ExpensesFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (value: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  availableCurrencies: string[];
  exchangeRates: Record<string, number> | undefined;
  isLoadingRates: boolean;
}

export function ExpensesFilters({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  availableCurrencies,
  exchangeRates,
  isLoadingRates,
}: ExpensesFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("common.month")}
        </label>
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={String(selectedMonth)} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[calc(100%-4.5rem)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_KEYS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("common.year")}
        </label>
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevYear}
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
            onClick={onNextYear}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </div>
      {availableCurrencies.length > 1 && (
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-subgrid gap-4">
          <div className="flex flex-col gap-1 md:col-start-2 lg:col-start-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("expenses.exchangeRates")}
            </label>
            <div className="text-xs text-gray-600 rounded-md space-y-1">
              {isLoadingRates ? (
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3.75 w-full" />
                  <Skeleton className="h-3.75 w-full" />
                </div>
              ) : (
                availableCurrencies.flatMap((from) =>
                  availableCurrencies
                    .filter((to) => to !== from)
                    .map((to) => {
                      const rate = exchangeRates?.[`${from}_${to}`];
                      return (
                        <div
                          key={`${from}_${to}`}
                          className="flex justify-between"
                        >
                          <span className="font-medium">
                            {from} → {to}:
                          </span>
                          <span>{rate ? rate.toFixed(4) : "N/A"}</span>
                        </div>
                      );
                    }),
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
