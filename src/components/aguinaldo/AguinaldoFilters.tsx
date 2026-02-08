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
import { CURRENCIES } from "./utils";

interface AguinaldoFiltersProps {
  aguinaldoYear: number;
  currency: string;
  onPrevYear: () => void;
  onNextYear: () => void;
  onCurrencyChange: (currency: string) => void;
}

export function AguinaldoFilters({
  aguinaldoYear,
  currency,
  onPrevYear,
  onNextYear,
  onCurrencyChange,
}: AguinaldoFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("aguinaldo.aguinaldoYear")}
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
            {aguinaldoYear}
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
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("common.currency")}
        </label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
