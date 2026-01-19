import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, ChevronDownIcon, RotateCw } from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  useDeleteExpense,
  useTogglePaid,
} from "@/hooks/useExpenses";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Button } from "@/components/ui/button";
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
    currency: "",
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

  const handleResetFilters = () => {
    const initialStartDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const initialEndDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setFilters({
      startDate: format(initialStartDate, "yyyy-MM-dd"),
      endDate: format(initialEndDate, "yyyy-MM-dd"),
      currency: "",
      isPaid: undefined as boolean | undefined,
    });
  };

  // Get unique currencies from expenses
  const currencies = Array.from(
    new Set(expenses?.map((e) => e.currency) || []),
  );

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
        <div className="border-b pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
            <div className="flex flex-col gap-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <Select
                value={filters.currency}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    currency: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">
                    All
                  </SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={
                  filters.isPaid === undefined
                    ? ""
                    : filters.isPaid
                      ? "paid"
                      : "pending"
                }
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    isPaid: value === "all" ? undefined : value === "paid",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">
                    All
                  </SelectItem>
                  <SelectItem key="pending" value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem key="paid" value="paid">
                    Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="flex items-center justify-center gap-2 w-full"
              variant="ghostDestructive"
              onClick={handleResetFilters}
            >
              <RotateCw className="w-4 h-4" /> Reset filters
            </Button>
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
                className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-lg overflow-hidden"
              >
                <div className="px-2 py-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Period: {period}
                  </h3>
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
            <p className="text-gray-500 mb-4">No expenses found</p>
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
