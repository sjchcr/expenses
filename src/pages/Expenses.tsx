import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Plus,
  CircleOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  useDeleteExpense,
  useTogglePaid,
} from "@/hooks/useExpenses";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { DeleteExpenseDialog } from "@/components/expenses/DeleteExpenseDialog";
import type { Expense } from "@/types";

// Month names for the select
const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

export default function Expenses() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Calculate start and end dates from selected month/year
  const getDateRange = (month: number, year: number) => {
    const startDate = startOfMonth(new Date(year, month, 1));
    const endDate = endOfMonth(new Date(year, month, 1));
    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    };
  };

  const [filters, setFilters] = useState(() => ({
    ...getDateRange(selectedMonth, selectedYear),
    isPaid: undefined as boolean | undefined,
  }));

  const updateFilters = (month: number, year: number) => {
    setFilters((prev) => ({
      ...prev,
      ...getDateRange(month, year),
    }));
  };

  const handleMonthChange = (value: string) => {
    const month = Number(value);
    setSelectedMonth(month);
    updateFilters(month, selectedYear);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
      updateFilters(11, selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
      updateFilters(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    updateFilters(nextMonth, nextYear);
  };

  const handlePrevYear = () => {
    const newYear = selectedYear - 1;
    setSelectedYear(newYear);
    updateFilters(selectedMonth, newYear);
  };

  const handleNextYear = () => {
    const newYear = selectedYear + 1;
    setSelectedYear(newYear);
    updateFilters(selectedMonth, newYear);
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [togglingExpenseId, setTogglingExpenseId] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useExpenses(filters);
  const { settings } = useUserSettings();
  const deleteMutation = useDeleteExpense();
  const togglePaidMutation = useTogglePaid();

  // Get all unique currencies from expenses for exchange rate display
  const availableCurrencies = useMemo(() => {
    if (!expenses) return [];
    return Array.from(
      new Set(expenses.flatMap((e) => e.amounts.map((a) => a.currency))),
    );
  }, [expenses]);

  // Fetch exchange rates for display
  const { data: exchangeRates, isLoading: isLoadingRates } =
    useExchangeRates(availableCurrencies);

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      await deleteMutation.mutateAsync(expenseToDelete.id);
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleTogglePaid = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTogglingExpenseId(id);
    try {
      await togglePaidMutation.mutateAsync({ id, isPaid: newStatus });
      toast.success(`Expense marked as ${newStatus ? "paid" : "pending"}`);
    } catch (error) {
      toast.error("Failed to update expense status");
    } finally {
      setTogglingExpenseId(null);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddDialogOpen(true);
  };

  // Group expenses by payment period
  const expensesByPeriod = useMemo(() => {
    if (!expenses) return {};

    const grouped: Record<string, Expense[]> = {};

    expenses.forEach((expense) => {
      const period = expense.payment_period;
      if (!grouped[period]) {
        grouped[period] = [];
      }
      grouped[period].push(expense);
    });

    return grouped;
  }, [expenses]);

  // Get sorted period keys
  const sortedPeriods = Object.keys(expensesByPeriod).sort();

  return (
    <div className="w-full mx-auto py-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
            <div className="text-sm text-gray-600">
              Manage your monthly expenses, view payment periods, and track your
              payment status.
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingExpense(null);
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <ButtonGroup className="w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={String(selectedMonth)}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[calc(100%-4.5rem)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <ButtonGroup className="w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevYear}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <ButtonGroupText className="w-[calc(100%-4.5rem)] justify-center bg-background text-sm shadow-sm">
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
          {availableCurrencies.length > 1 && (
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-subgrid gap-4">
              <div className="flex flex-col gap-1 md:col-start-2 lg:col-start-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rates
                </label>
                <div className="text-xs text-gray-600 rounded-md space-y-1">
                  {isLoadingRates ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading rates...
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

        {/* Tables by Payment Period */}
        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedPeriods.map((period) => (
              <div
                key={period}
                className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-center gap-2 px-2 py-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {period}
                  </h3>
                  <Button
                    size="icon"
                    onClick={() => {
                      setEditingExpense(null);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ExpenseTable
                  expenses={expensesByPeriod[period]}
                  togglingExpenseId={togglingExpenseId}
                  onTogglePaid={handleTogglePaid}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 shadow-md rounded-xl p-8 text-center">
            <p className="flex flex-col justify-center items-center gap-2 text-gray-500 mb-4">
              <CircleOff className="h-6 w-6" />
              No expenses found
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          </div>
        )}
      </div>

      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingExpense(null);
        }}
        expense={editingExpense}
        paymentPeriods={settings?.payment_periods || []}
      />

      <DeleteExpenseDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setExpenseToDelete(null);
        }}
        expense={expenseToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
