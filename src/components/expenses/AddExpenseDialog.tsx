import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import { expensesService } from "@/services/expenses.service";
import type { Expense, ExpenseAmount, PaymentPeriod } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDownIcon, Plus, Trash2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  paymentPeriods: PaymentPeriod[];
}

const COMMON_CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP", "JPY"];

interface AmountFormData {
  currency: string;
  amount: string;
  exchange_rate: string;
  exchange_rate_source: "api" | "manual";
}

const createEmptyAmount = (): AmountFormData => ({
  currency: "USD",
  amount: "",
  exchange_rate: "",
  exchange_rate_source: "api",
});

export function AddExpenseDialog({
  open,
  onOpenChange,
  expense,
  paymentPeriods,
}: AddExpenseDialogProps) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isPaid, setIsPaid] = useState(false);
  const [amounts, setAmounts] = useState<AmountFormData[]>([
    createEmptyAmount(),
  ]);
  const [openStartDate, setOpenStartDate] = useState(false);

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setDueDate(expense.due_date);
      setIsPaid(expense.is_paid || false);
      setAmounts(
        expense.amounts.map((a) => ({
          currency: a.currency,
          amount: a.amount.toString(),
          exchange_rate: a.exchange_rate?.toString() || "",
          exchange_rate_source: a.exchange_rate_source || "api",
        })),
      );
    } else {
      setName("");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setIsPaid(false);
      setAmounts([createEmptyAmount()]);
    }
  }, [expense, open]);

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
      }));

    if (expenseAmounts.length === 0) {
      alert("Please add at least one amount.");
      return;
    }

    const expenseData = {
      name,
      due_date: dueDate,
      is_paid: isPaid,
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
      alert("Failed to save expense. Please try again.");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rent, Electricity, Groceries"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Amounts *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddAmount}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Currency
              </Button>
            </div>
            <div className="space-y-3">
              {amounts.map((amountData, index) => (
                <div key={index} className="space-y-2">
                  <div className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
                    <div>
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
                    </div>
                    <Select
                      value={amountData.currency}
                      onValueChange={(value) =>
                        handleAmountChange(index, "currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CURRENCIES.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAmount(index)}
                      disabled={amounts.length === 1}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-start gap-2">
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
                      placeholder="Exchange rate (optional)"
                      className="text-sm"
                    />
                    <span className="text-xs text-gray-500 mx-2">
                      If provided, this exchange rate will be used instead of
                      fetching from an external API.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due date
            </label>
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {dueDate ? dueDate : "Select date"}
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
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDueDate(format(date!, "yyyy-MM-dd"));
                    setOpenStartDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-1">
            <Checkbox
              id="is_paid"
              checked={isPaid}
              onCheckedChange={(checked) => setIsPaid(checked as boolean)}
            />
            <Label htmlFor="is_paid">Already paid</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : expense ? "Update" : "Add"} Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
