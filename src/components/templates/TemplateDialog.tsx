import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { Checkbox } from "@/components/ui/checkbox";
import type { ExpenseTemplate, TemplateAmount } from "@/types";
import { ButtonGroup } from "../ui/button-group";

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

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ExpenseTemplate | null;
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

export function TemplateDialog({
  open,
  onOpenChange,
  template,
}: TemplateDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const [formData, setFormData] = useState<TemplateFormData>(
    createEmptyFormData(),
  );

  const isEditing = !!template;

  useEffect(() => {
    if (open && template) {
      setFormData({
        name: template.name,
        amounts: template.amounts.map((a) => ({
          currency: a.currency,
          amount: a.amount?.toString() || "",
        })),
        is_recurring: template.is_recurring || false,
        recurrence_day: template.recurrence_day,
      });
    } else if (!open) {
      setFormData(createEmptyFormData());
    }
  }, [open, template]);

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
      if (isEditing && template) {
        await updateMutation.mutateAsync({
          id: template.id,
          updates: templateData,
        });
        toast.success(t("templates.templateUpdated"));
      } else {
        await createMutation.mutateAsync(templateData);
        toast.success(t("templates.templateCreated"));
      }
      handleClose();
    } catch {
      toast.error(t("expenses.failedToSave"));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>
            {isEditing
              ? t("templates.editTemplate")
              : t("templates.createTemplate")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("templates.editTemplateDescription")
              : t("templates.createTemplateDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto p-4"
        >
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
                <Plus className="h-3 w-3" />
                {t("templates.addCurrency")}
              </Button>
            </div>
            <div className="space-y-3">
              {formData.amounts.map((amountData, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="grid w-full gap-4">
                    <ButtonGroup className="w-full">
                      <Select
                        value={amountData.currency}
                        onValueChange={(value) =>
                          handleAmountChange(index, "currency", value)
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent className="min-w-24">
                          <SelectGroup>
                            {COMMON_CURRENCIES.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectGroup>
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
                    </ButtonGroup>
                  </div>
                  <Button
                    type="button"
                    variant="ghostDestructive"
                    size="icon"
                    onClick={() => handleRemoveAmount(index)}
                    disabled={formData.amounts.length === 1}
                    className="aspect-square"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 pl-3">
              {t("templates.amountOptionalHint")}
            </p>
          </div>

          <div className="flex items-center gap-2 pl-3">
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
            <Label htmlFor="is_recurring" className="pl-0">
              {t("templates.isRecurring")}
            </Label>
          </div>

          {formData.is_recurring && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="recurrence_day">
                  {t("templates.recurrenceDay")} *
                </Label>
                <p className="text-xs text-gray-500 mt-1 pl-3">
                  {t("templates.recurrenceDayHint")}
                </p>
              </div>
              <Select
                value={String(formData.recurrence_day || 1)}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    recurrence_day: parseInt(value, 10),
                  })
                }
              >
                <SelectTrigger id="recurrence_day" className="w-full">
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
            </div>
          )}
        </form>
        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("common.saving")
              : isEditing
              ? t("common.update")
              : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
