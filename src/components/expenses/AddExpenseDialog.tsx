import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import { expensesService } from "@/services/expenses.service";
import type { Expense, ExpenseAmount, PaymentPeriod } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Plus, Trash2, FileText, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useTemplates } from "@/hooks/useTemplates";
import { ButtonGroup } from "@/components/ui/button-group";
import { useMobile } from "@/hooks/useMobile";
import { Spinner } from "@/components/ui/spinner";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  paymentPeriods: PaymentPeriod[];
  defaultMonth?: number;
  defaultYear?: number;
}

const COMMON_CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP", "JPY"];

interface AmountFormData {
  currency: string;
  amount: string;
  exchange_rate: string;
  exchange_rate_source: "api" | "manual";
  paid: boolean;
}

const createEmptyAmount = (): AmountFormData => ({
  currency: "USD",
  amount: "",
  exchange_rate: "",
  exchange_rate_source: "api",
  paid: false,
});

export function AddExpenseDialog({
  open,
  onOpenChange,
  expense,
  paymentPeriods,
  defaultMonth,
  defaultYear,
}: AddExpenseDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const getDefaultDate = () => {
    const now = new Date();
    const year = defaultYear ?? now.getFullYear();
    const month = defaultMonth ?? now.getMonth();
    return format(new Date(year, month, now.getDate()), "yyyy-MM-dd");
  };

  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(getDefaultDate);
  const [amounts, setAmounts] = useState<AmountFormData[]>([
    createEmptyAmount(),
  ]);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    parseISO(getDefaultDate()),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const { data: templates } = useTemplates();

  // Filter templates that match the current name input for auto-suggest
  const suggestedTemplates = useMemo(() => {
    if (!templates || !name || name.length < 2 || expense) return [];
    const lowerName = name.toLowerCase();
    return templates
      .filter((t) => t.name.toLowerCase().includes(lowerName))
      .slice(0, 5);
  }, [templates, name, expense]);

  // Helper to apply template data to form
  const applyTemplate = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      setName(template.name);
      // Map template amounts to form amounts
      const templateAmounts = template.amounts.map((a) => ({
        currency: a.currency,
        amount: a.amount?.toString() || "",
        exchange_rate: "",
        exchange_rate_source: "api" as const,
        paid: false,
      }));
      setAmounts(
        templateAmounts.length > 0 ? templateAmounts : [createEmptyAmount()],
      );
      // If recurring, set due date to this month's recurrence day
      if (template.is_recurring && template.recurrence_day) {
        const today = new Date();
        const recurrenceDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          template.recurrence_day,
        );
        if (recurrenceDate < today) {
          recurrenceDate.setMonth(recurrenceDate.getMonth() + 1);
        }
        setDueDate(format(recurrenceDate, "yyyy-MM-dd"));
      }
      setSelectedTemplateId(templateId);
    }
  };

  const handleSuggestionSelect = (templateId: string) => {
    applyTemplate(templateId);
    setShowSuggestions(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId && templateId !== "none") {
      applyTemplate(templateId);
    }
  };

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setDueDate(expense.due_date);
      setCalendarMonth(parseISO(expense.due_date));
      setAmounts(
        expense.amounts.map((a) => ({
          currency: a.currency,
          amount: a.amount.toString(),
          exchange_rate: a.exchange_rate?.toString() || "",
          exchange_rate_source: a.exchange_rate_source || "api",
          paid: a.paid || false,
        })),
      );
      setSelectedTemplateId("");
    } else {
      const defaultDate = getDefaultDate();
      setName("");
      setDueDate(defaultDate);
      setCalendarMonth(parseISO(defaultDate));
      setAmounts([createEmptyAmount()]);
      setSelectedTemplateId("");
    }
  }, [expense, open, defaultMonth, defaultYear]);

  const handleAddAmount = () => {
    setAmounts([...amounts, createEmptyAmount()]);
  };

  const handleRemoveAmount = (index: number) => {
    if (amounts.length > 1) {
      setAmounts(amounts.filter((_, i) => i !== index));
    }
  };

  const handleAmountChange = (
    index: number,
    field: keyof AmountFormData,
    value: string,
  ) => {
    const newAmounts = [...amounts];
    newAmounts[index] = { ...newAmounts[index], [field]: value };
    if (field === "exchange_rate" && value) {
      newAmounts[index].exchange_rate_source = "manual";
    }
    setAmounts(newAmounts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDueDate = parseISO(dueDate);
    const paymentPeriod = expensesService.getPaymentPeriod(
      parsedDueDate,
      paymentPeriods,
    );

    const expenseAmounts: ExpenseAmount[] = amounts
      .filter((a) => a.amount && parseFloat(a.amount) > 0)
      .map((a) => ({
        currency: a.currency,
        amount: parseFloat(a.amount),
        exchange_rate: a.exchange_rate ? parseFloat(a.exchange_rate) : null,
        exchange_rate_source: a.exchange_rate ? a.exchange_rate_source : null,
        paid: a.paid,
      }));

    if (expenseAmounts.length === 0) {
      alert(t("expenses.addAtLeastOneAmount"));
      return;
    }

    // is_paid is true only if all amounts are paid
    const allPaid = expenseAmounts.every((a) => a.paid);

    const expenseData = {
      name,
      due_date: dueDate,
      is_paid: allPaid,
      payment_period: paymentPeriod,
      amounts: expenseAmounts,
    };

    try {
      if (expense) {
        await updateMutation.mutateAsync({
          id: expense.id,
          updates: expenseData,
        });
      } else {
        await createMutation.mutateAsync(expenseData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert(t("expenses.failedToSave"));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={isMobile}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>
            {expense ? t("expenses.editExpense") : t("expenses.addNewExpense")}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? t("expenses.editExpenseDescription")
              : t("expenses.addExpenseDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {!expense && templates && templates.length > 0 && (
              <div className="pb-2 border-b">
                <Label htmlFor="template" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {t("expenses.createFromTemplate")}
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger id="template" className="mt-1 w-full">
                    <SelectValue placeholder={t("expenses.selectTemplate")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">
                      {t("expenses.noTemplate")}
                    </SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} (
                        {template.amounts.map((a) => a.currency).join(", ")})
                        {template.is_recurring && " - Recurring"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative">
              <Label htmlFor="name">{t("common.name")} *</Label>
              <Input
                ref={nameInputRef}
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                  setSelectedTemplateId("");
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                placeholder={t("expenses.namePlaceholder")}
                required
                autoComplete="off"
              />
              {/* Auto-suggest dropdown */}
              {showSuggestions && suggestedTemplates.length > 0 && !expense && (
                <div className="absolute z-50 w-full mt-1 bg-background/60 backdrop-blur-2xl dark:bg-accent dark:border-accent border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                  <div className="px-2 py-1.5 text-xs text-gray-500 border-b">
                    {t("expenses.suggestionsFromTemplates")}
                  </div>
                  {suggestedTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between rounded-none!"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionSelect(template.id);
                      }}
                    >
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-gray-500">
                        {template.amounts.map((a) => a.currency).join(", ")}
                        {template.is_recurring && " · Recurring"}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t("expenses.amounts")} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddAmount}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  {t("expenses.addCurrency")}
                </Button>
              </div>
              <div className="space-y-3">
                {amounts.map((amountData, index) => (
                  <div
                    key={index}
                    className="space-y-2 pb-3 border-b border-dashed last:border-0 last:pb-0"
                  >
                    <div className="flex items-center w-full gap-2">
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
                          placeholder="0.00"
                          required={index === 0}
                        />
                      </ButtonGroup>
                      <Button
                        type="button"
                        variant="ghostDestructive"
                        size="icon"
                        onClick={() => handleRemoveAmount(index)}
                        disabled={amounts.length === 1}
                        className="aspect-square"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 pl-3">
                        <Checkbox
                          id={`paid-${index}`}
                          checked={amountData.paid}
                          onCheckedChange={(checked) => {
                            const newAmounts = [...amounts];
                            newAmounts[index] = {
                              ...newAmounts[index],
                              paid: checked as boolean,
                            };
                            setAmounts(newAmounts);
                          }}
                        />
                        <Label
                          htmlFor={`paid-${index}`}
                          className="text-sm text-muted-foreground pl-0"
                        >
                          {t("common.paid")}
                        </Label>
                      </div>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={amountData.exchange_rate}
                        onChange={(e) =>
                          handleAmountChange(
                            index,
                            "exchange_rate",
                            e.target.value,
                          )
                        }
                        placeholder={t("expenses.exchangeRateOptional")}
                        className="text-sm w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground px-3">
                      {t("expenses.exchangeRateHint")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label
                htmlFor="due_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("expenses.dueDate")}
              </Label>
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                  >
                    {dueDate ? dueDate : t("expenses.selectDate")}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={parseISO(dueDate)}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDueDate(format(date!, "yyyy-MM-dd"));
                      setCalendarMonth(date!);
                      setOpenStartDate(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
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
                : expense
                ? t("common.update")
                : t("common.add")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
