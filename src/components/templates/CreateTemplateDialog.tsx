import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateTemplate } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { TemplateAmount } from "@/types";

const COMMON_CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP", "JPY"];

interface AmountFormData {
  currency: string;
  amount: string;
}

interface TemplateFormData {
  name: string;
  amounts: AmountFormData[];
  is_recurring: boolean;
  recurrence_day: number | null;
}

interface InitialData {
  name: string;
  amounts: { currency: string; amount: number }[];
}

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InitialData | null;
}

const createEmptyAmount = (): AmountFormData => ({
  currency: "USD",
  amount: "",
});

const createEmptyFormData = (): TemplateFormData => ({
  name: "",
  amounts: [createEmptyAmount()],
  is_recurring: false,
  recurrence_day: null,
});

export function CreateTemplateDialog({
  open,
  onOpenChange,
  initialData,
}: CreateTemplateDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateTemplate();
  const [formData, setFormData] = useState<TemplateFormData>(
    createEmptyFormData(),
  );

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name,
        amounts: initialData.amounts.map((a) => ({
          currency: a.currency,
          amount: a.amount.toString(),
        })),
        is_recurring: false,
        recurrence_day: null,
      });
    } else if (!open) {
      setFormData(createEmptyFormData());
    }
  }, [open, initialData]);

  const handleClose = () => {
    onOpenChange(false);
    setFormData(createEmptyFormData());
  };

  const handleAddAmount = () => {
    setFormData({
      ...formData,
      amounts: [...formData.amounts, createEmptyAmount()],
    });
  };

  const handleRemoveAmount = (index: number) => {
    if (formData.amounts.length > 1) {
      setFormData({
        ...formData,
        amounts: formData.amounts.filter((_, i) => i !== index),
      });
    }
  };

  const handleAmountChange = (
    index: number,
    field: keyof AmountFormData,
    value: string,
  ) => {
    const newAmounts = [...formData.amounts];
    newAmounts[index] = { ...newAmounts[index], [field]: value };
    setFormData({ ...formData, amounts: newAmounts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateAmounts: TemplateAmount[] = formData.amounts
      .filter((a) => a.currency)
      .map((a) => ({
        currency: a.currency,
        amount: a.amount ? parseFloat(a.amount) : null,
      }));

    if (templateAmounts.length === 0) {
      toast.error(t("templates.addAtLeastOneCurrency"));
      return;
    }

    const templateData = {
      name: formData.name,
      amounts: templateAmounts,
      is_recurring: formData.is_recurring,
      recurrence_day: formData.is_recurring ? formData.recurrence_day : null,
    };

    try {
      await createMutation.mutateAsync(templateData);
      toast.success(t("templates.templateCreated"));
      handleClose();
    } catch {
      toast.error(t("expenses.failedToSave"));
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("templates.createTemplate")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("templates.templateName")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("templates.templateNamePlaceholder")}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t("templates.currenciesAmounts")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddAmount}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t("templates.addCurrency")}
              </Button>
            </div>
            <div className="space-y-3">
              {formData.amounts.map((amountData, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[100px_1fr_auto] gap-2 items-end"
                >
                  <Select
                    value={amountData.currency}
                    onValueChange={(value) =>
                      handleAmountChange(index, "currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COMMON_CURRENCIES.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountData.amount}
                    onChange={(e) =>
                      handleAmountChange(index, "amount", e.target.value)
                    }
                    placeholder={t("templates.amountOptional")}
                  />
                  <Button
                    type="button"
                    variant="ghostDestructive"
                    size="sm"
                    onClick={() => handleRemoveAmount(index)}
                    disabled={formData.amounts.length === 1}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t("templates.amountOptionalHint")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  is_recurring: checked as boolean,
                  recurrence_day: checked ? formData.recurrence_day || 1 : null,
                })
              }
            />
            <Label htmlFor="is_recurring">{t("templates.isRecurring")}</Label>
          </div>

          {formData.is_recurring && (
            <div>
              <Label htmlFor="recurrence_day">
                {t("templates.recurrenceDay")} *
              </Label>
              <Select
                value={String(formData.recurrence_day || 1)}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    recurrence_day: parseInt(value, 10),
                  })
                }
              >
                <SelectTrigger id="recurrence_day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {t("templates.recurrenceDayHint")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : t("common.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
