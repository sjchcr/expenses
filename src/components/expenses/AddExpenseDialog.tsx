import { useState, useEffect } from "react";
import { format, set } from "date-fns";
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
import type { Expense, PaymentPeriod } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  paymentPeriods: PaymentPeriod[];
}

const COMMON_CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP", "JPY"];

export function AddExpenseDialog({
  open,
  onOpenChange,
  expense,
  paymentPeriods,
}: AddExpenseDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "CRC",
    due_date: format(new Date(), "yyyy-MM-dd"),
    is_paid: false,
    exchange_rate: "",
    exchange_rate_source: "api" as "api" | "manual",
  });
  const [openStartDate, setOpenStartDate] = useState(false);

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        currency: expense.currency,
        due_date: expense.due_date,
        is_paid: expense.is_paid || false,
        exchange_rate: expense.exchange_rate?.toString() || "",
        exchange_rate_source:
          expense.exchange_rate_source === "manual" ? "manual" : "api",
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        currency: "USD",
        due_date: format(new Date(), "yyyy-MM-dd"),
        is_paid: false,
        exchange_rate: "",
        exchange_rate_source: "api",
      });
    }
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dueDate = new Date(formData.due_date);
    const paymentPeriod = expensesService.getPaymentPeriod(
      dueDate,
      paymentPeriods,
    );

    const expenseData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      due_date: formData.due_date,
      is_paid: formData.is_paid,
      payment_period: paymentPeriod,
      exchange_rate: formData.exchange_rate
        ? parseFloat(formData.exchange_rate)
        : null,
      exchange_rate_source: formData.exchange_rate
        ? formData.exchange_rate_source
        : null,
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
      <DialogContent>
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
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Rent, Electricity, Groceries"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start date
            </label>
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {formData.due_date ? formData.due_date : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={new Date(formData.due_date)}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setFormData({
                      ...formData,
                      due_date: format(date!, "yyyy-MM-dd"),
                    });
                    setOpenStartDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-1">
            <Checkbox
              id="is_paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_paid: checked as boolean })
              }
            />
            <Label htmlFor="is_paid">Already paid</Label>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">
              Exchange Rate (Optional)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exchange_rate">Custom Rate</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.000001"
                  min="0"
                  value={formData.exchange_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exchange_rate: e.target.value,
                      exchange_rate_source: "manual",
                    })
                  }
                  placeholder="Leave empty for API rate"
                />
              </div>

              <div>
                <Label htmlFor="exchange_rate_source">Source</Label>
                <Select
                  //id="exchange_rate_source"
                  value={formData.exchange_rate_source}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      exchange_rate_source: value as "api" | "manual",
                    })
                  }
                  disabled={!formData.exchange_rate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If you don't specify a custom rate, we'll use the current exchange
              rate from the API
            </p>
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
