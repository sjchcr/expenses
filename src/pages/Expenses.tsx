import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, ChevronDownIcon, CircleOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  useDeleteExpense,
  useTogglePaid,
} from "@/hooks/useExpenses";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { DeleteExpenseDialog } from "@/components/expenses/DeleteExpenseDialog";
import type { Expense } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Expenses() {
  const [openStartDate, setOpenStartDate] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [openEndDate, setOpenEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  );

  const [filters, setFilters] = useState({
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
    isPaid: undefined as boolean | undefined,
  });

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

  const handleDateChange = (type: "start" | "end", date: Date) => {
    if (type === "start") {
      setStartDate(date);
      setFilters({
        ...filters,
        startDate: format(date, "yyyy-MM-dd"),
      });
    } else {
      setEndDate(date);
      setFilters({
        ...filters,
        endDate: format(date, "yyyy-MM-dd"),
      });
    }
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
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
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="date"
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
                    {format(startDate, "yyyy-MM-dd")}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      handleDateChange("start", date!);
                      setOpenStartDate(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End date
              </label>
              <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                  >
                    {format(endDate, "yyyy-MM-dd")}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      handleDateChange("end", date!);
                      setOpenEndDate(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div></div>
            {availableCurrencies.length > 1 && (
              <div className="flex flex-col gap-1 w-full col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rates
                </label>
                <div className="text-xs text-gray-600 bg-gray-50 rounded-md p-2 space-y-1">
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
            )}
          </div>
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
          <div className="bg-white shadow rounded-lg p-8 text-center">
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
