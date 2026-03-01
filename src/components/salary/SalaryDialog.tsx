import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, CheckIcon, ChevronDownIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  useCreateSalaryRecord,
  useUpdateSalaryRecord,
} from "@/hooks/useSalary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import type { SalaryRecord, SalarySettings, SalaryDeduction } from "@/types";
import {
  DEFAULT_SALARY_DEDUCTIONS,
  decimalToPercentage,
  percentageToDecimal,
  formatCurrency,
} from "@/lib/salaryCalculations";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { cn } from "@/lib/utils";

const CURRENCIES = ["CRC", "USD"];

interface DeductionFormItem {
  id: string;
  name: string;
  type: "percentage" | "nominal";
  amount: string;
  active: boolean;
}

interface SalaryFormData {
  label: string;
  effective_date: string;
  gross_amount: string;
  currency: string;
  deductions: DeductionFormItem[];
}

function deductionsToForm(deductions: SalaryDeduction[]): DeductionFormItem[] {
  return deductions.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    amount:
      d.type === "percentage"
        ? decimalToPercentage(d.amount).toString()
        : d.amount.toString(),
    active: d.active,
  }));
}

function formToDeductions(items: DeductionFormItem[]): SalaryDeduction[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    amount:
      item.type === "percentage"
        ? percentageToDecimal(parseFloat(item.amount) || 0)
        : parseFloat(item.amount) || 0,
    active: item.active,
  }));
}

const createEmptyFormData = (
  settings: SalarySettings | null,
): SalaryFormData => ({
  label: "",
  effective_date: format(new Date(), "yyyy-MM-dd"),
  gross_amount: "",
  currency: "CRC",
  deductions: deductionsToForm(
    settings?.deductions?.length
      ? settings.deductions
      : DEFAULT_SALARY_DEDUCTIONS,
  ),
});

interface SalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SalaryRecord | null;
  settings: SalarySettings | null;
  previousRecord?: SalaryRecord | null;
}

export function SalaryDialog({
  open,
  onOpenChange,
  record,
  settings,
  previousRecord,
}: SalaryDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const createMutation = useCreateSalaryRecord();
  const updateMutation = useUpdateSalaryRecord();
  const isEditing = !!record;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState<SalaryFormData>(() =>
    createEmptyFormData(settings),
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [raisePercent, setRaisePercent] = useState("");

  useEffect(() => {
    if (open && record) {
      setFormData({
        label: record.label,
        effective_date: record.effective_date,
        gross_amount: record.gross_amount.toString(),
        currency: record.currency,
        deductions: deductionsToForm(record.deductions),
      });
      setCalendarMonth(parseISO(record.effective_date));
    } else if (!open) {
      setFormData(createEmptyFormData(settings));
      setCalendarMonth(new Date());
      setRaisePercent("");
    }
  }, [open, record, settings]);

  const updateDeduction = (
    index: number,
    field: keyof DeductionFormItem,
    value: string | boolean,
  ) => {
    const next = [...formData.deductions];
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, deductions: next });
  };

  const handleAddDeduction = () => {
    setFormData({
      ...formData,
      deductions: [
        ...formData.deductions,
        {
          id: crypto.randomUUID(),
          name: "",
          type: "percentage",
          amount: "",
          active: true,
        },
      ],
    });
  };

  const handleRemoveDeduction = (index: number) => {
    setFormData({
      ...formData,
      deductions: formData.deductions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!formData.label.trim()) {
      toast.error(t("salary.deductionNameRequired"));
      return;
    }

    const grossAmount = parseFloat(formData.gross_amount);
    if (isNaN(grossAmount) || grossAmount <= 0) {
      toast.error(t("salary.invalidDeductionAmount"));
      return;
    }

    for (const d of formData.deductions) {
      if (!d.name.trim()) {
        toast.error(t("salary.deductionNameRequired"));
        return;
      }
      const amount = parseFloat(d.amount);
      if (isNaN(amount) || amount < 0) {
        toast.error(t("salary.invalidDeductionAmount"));
        return;
      }
      if (d.type === "percentage" && amount > 100) {
        toast.error(t("salary.invalidDeductionPercentage"));
        return;
      }
    }

    const payload = {
      label: formData.label.trim(),
      effective_date: formData.effective_date,
      gross_amount: grossAmount,
      currency: formData.currency,
      deductions: formToDeductions(formData.deductions),
    };

    try {
      if (isEditing && record) {
        await updateMutation.mutateAsync({ id: record.id, updates: payload });
        toast.success(t("salary.salaryUpdated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("salary.salaryCreated"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("salary.salaryFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0" submitOnTop={isMobile}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>
            {isEditing ? t("salary.editSalary") : t("salary.addSalary")}
          </DialogTitle>
          <DialogDescription>{t("salary.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Label */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="label">{t("salary.salaryLabel")} *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder={t("salary.salaryLabelPlaceholder")}
              />
            </div>

            {/* Effective date */}
            <div className="flex flex-col gap-2">
              <Label>{t("salary.effectiveDate")} *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {formData.effective_date || t("stocks.selectDate")}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={parseISO(formData.effective_date)}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        effective_date: format(date!, "yyyy-MM-dd"),
                      });
                      setCalendarMonth(date!);
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gross amount + currency */}
            <div className="flex justify-start gap-2">
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="gross_amount">
                  {t("salary.grossAmount")} *
                </Label>
                <div className="flex flex-col w-full gap-0">
                  {/* Previous salary raise helper (create mode only) */}
                  {!isEditing && previousRecord && (
                    <div className="flex flex-col items-start gap-2 p-2 rounded-t-md bg-muted border text-sm">
                      <span className="text-muted-foreground shrink-0">
                        {t("salary.previousSalaryHint")}
                      </span>
                      <div className="flex items-center gap-2 w-full">
                        <div className="grid grid-cols-2 items-center gap-2 w-full">
                          <Label className="pl-0 col-span-1">
                            {formatCurrency(
                              previousRecord.gross_amount,
                              previousRecord.currency,
                            )}
                          </Label>
                          <InputGroup className="bg-background hover:bg-accent has-[[data-slot=input-group-control]:focus-visible]:bg-input/30 col-span-1">
                            <InputGroupInput
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={raisePercent}
                              onChange={(e) => setRaisePercent(e.target.value)}
                              placeholder={t("salary.raisePercent")}
                              className="w-28 h-7 hover:bg-transparent"
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>%</InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="default"
                          className="text-xs shrink-0"
                          onClick={() => {
                            const raise = parseFloat(raisePercent) || 0;
                            const newAmount =
                              previousRecord.gross_amount * (1 + raise / 100);
                            setFormData({
                              ...formData,
                              gross_amount: newAmount.toFixed(2),
                              currency: previousRecord.currency,
                            });
                          }}
                        >
                          <CheckIcon />
                        </Button>
                      </div>
                    </div>
                  )}
                  <Input
                    id="gross_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.gross_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, gross_amount: e.target.value })
                    }
                    placeholder="0.00"
                    className={cn(
                      !isEditing &&
                        previousRecord &&
                        "rounded-t-none rounded-b-md",
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="flex flex-col justify-start gap-2">
              <Label>{t("salary.currency")}</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => setFormData({ ...formData, currency: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deductions */}
            <Separator />
            <div className="flex flex-col gap-2">
              <div>
                <Label>{t("salary.deductions")}</Label>
                <p className="text-xs text-muted-foreground ml-3">
                  {t("salary.deductionTemplatesDescription")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {formData.deductions.map((d, i) => (
                  <div
                    key={d.id}
                    className={cn(
                      !d.active && "opacity-50",
                      "flex items-center gap-2",
                    )}
                  >
                    {/* Active toggle */}
                    <Checkbox
                      checked={d.active}
                      onCheckedChange={(checked) =>
                        updateDeduction(i, "active", !!checked)
                      }
                    />
                    {/* Name */}
                    <Input
                      className="flex-1"
                      value={d.name}
                      onChange={(e) =>
                        updateDeduction(i, "name", e.target.value)
                      }
                      disabled={!d.active}
                      placeholder={t("salary.deductionNamePlaceholder")}
                    />
                    {/* Type toggle */}
                    <Button
                      type="button"
                      size="icon"
                      variant={d.type === "percentage" ? "default" : "outline"}
                      className="shrink-0 px-0"
                      disabled={!d.active}
                      onClick={() =>
                        updateDeduction(
                          i,
                          "type",
                          d.type === "percentage" ? "nominal" : "percentage",
                        )
                      }
                    >
                      {d.type === "percentage" ? "%" : "$"}
                    </Button>
                    {/* Amount */}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={d.type === "percentage" ? "100" : undefined}
                      className="w-24 shrink-0"
                      value={d.amount}
                      onChange={(e) =>
                        updateDeduction(i, "amount", e.target.value)
                      }
                      placeholder="0"
                      disabled={!d.active}
                    />
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={!d.active}
                      onClick={() => handleRemoveDeduction(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDeduction}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                {t("salary.addDeduction")}
              </Button>
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
              onClick={() => onOpenChange(false)}
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
