import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { useCreateStockPeriod, useUpdateStockPeriod } from "@/hooks/useStocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import type { StockPeriod } from "@/types";

interface StockPeriodFormData {
  vesting_date: string;
  quantity: string;
  stock_price_usd: string;
  notes: string;
}

interface StockPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: StockPeriod | null;
  defaultYear?: number;
}

const getDefaultDate = (defaultYear?: number): string => {
  const now = new Date();
  const year = defaultYear ?? now.getFullYear();
  return format(new Date(year, now.getMonth(), now.getDate()), "yyyy-MM-dd");
};

const createEmptyFormData = (defaultYear?: number): StockPeriodFormData => ({
  vesting_date: getDefaultDate(defaultYear),
  quantity: "",
  stock_price_usd: "",
  notes: "",
});

export function StockPeriodDialog({
  open,
  onOpenChange,
  period,
  defaultYear,
}: StockPeriodDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const createMutation = useCreateStockPeriod();
  const updateMutation = useUpdateStockPeriod();
  const [formData, setFormData] = useState<StockPeriodFormData>(
    createEmptyFormData(defaultYear),
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    parseISO(getDefaultDate(defaultYear)),
  );

  const isEditing = !!period;

  useEffect(() => {
    if (open && period) {
      setFormData({
        vesting_date: period.vesting_date,
        quantity: period.quantity.toString(),
        stock_price_usd: period.stock_price_usd.toString(),
        notes: period.notes || "",
      });
      setCalendarMonth(parseISO(period.vesting_date));
    } else if (!open) {
      const defaultDate = getDefaultDate(defaultYear);
      setFormData(createEmptyFormData(defaultYear));
      setCalendarMonth(parseISO(defaultDate));
    }
  }, [open, period, defaultYear]);

  const handleClose = () => {
    onOpenChange(false);
    setFormData(createEmptyFormData(defaultYear));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vesting_date) {
      toast.error(t("stocks.vestingDateRequired"));
      return;
    }

    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error(t("stocks.quantityRequired"));
      return;
    }

    const stockPriceUsd = parseFloat(formData.stock_price_usd);
    if (isNaN(stockPriceUsd) || stockPriceUsd < 0) {
      toast.error(t("stocks.priceRequired"));
      return;
    }

    const periodData = {
      vesting_date: formData.vesting_date,
      quantity,
      stock_price_usd: stockPriceUsd,
      notes: formData.notes.trim() || null,
    };

    try {
      if (isEditing && period) {
        await updateMutation.mutateAsync({
          id: period.id,
          updates: periodData,
        });
        toast.success(t("stocks.periodUpdated"));
      } else {
        await createMutation.mutateAsync(periodData);
        toast.success(t("stocks.periodCreated"));
      }
      handleClose();
    } catch {
      toast.error(t("stocks.periodFailed"));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={true}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>
            {isEditing ? t("stocks.editPeriod") : t("stocks.addPeriod")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("stocks.editPeriodDescription")
              : t("stocks.addPeriodDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>{t("stocks.vestingDate")} *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {formData.vesting_date
                      ? formData.vesting_date
                      : t("stocks.selectDate")}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={parseISO(formData.vesting_date)}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        vesting_date: format(date!, "yyyy-MM-dd"),
                      });
                      setCalendarMonth(date!);
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">{t("stocks.quantity")} *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder={t("stocks.quantityPlaceholder")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="stock_price_usd">
                {t("stocks.stockPriceUsd")} *
              </Label>
              <Input
                id="stock_price_usd"
                type="number"
                step="0.01"
                min="0"
                value={formData.stock_price_usd}
                onChange={(e) =>
                  setFormData({ ...formData, stock_price_usd: e.target.value })
                }
                placeholder={t("stocks.pricePlaceholder")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">{t("stocks.notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t("stocks.notesPlaceholder")}
                rows={3}
              />
            </div>
          </form>
        </DialogBody>
        {isMobile ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isLoading}
            className="absolute top-4 right-4"
          >
            {isLoading ? <Spinner /> : <Check />}
          </Button>
        ) : (
          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? t("common.saving")
                : isEditing
                  ? t("common.update")
                  : t("common.create")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
