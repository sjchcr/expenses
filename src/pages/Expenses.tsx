import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Plus,
  CircleOff,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  useDeleteExpense,
  useToggleAmountPaid,
} from "@/hooks/useExpenses";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useTemplateGroups } from "@/hooks/useTemplateGroups";
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
import { CreateFromGroupDialog } from "@/components/expenses/CreateFromGroupDialog";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { DeleteExpenseDialog } from "@/components/expenses/DeleteExpenseDialog";
import type { Expense } from "@/types";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/useMobile";

// Month names for the select - using translation keys
const MONTH_KEYS = [
  { value: "0", labelKey: "months.january" },
  { value: "1", labelKey: "months.february" },
  { value: "2", labelKey: "months.march" },
  { value: "3", labelKey: "months.april" },
  { value: "4", labelKey: "months.may" },
  { value: "5", labelKey: "months.june" },
  { value: "6", labelKey: "months.july" },
  { value: "7", labelKey: "months.august" },
  { value: "8", labelKey: "months.september" },
  { value: "9", labelKey: "months.october" },
  { value: "10", labelKey: "months.november" },
  { value: "11", labelKey: "months.december" },
];

export default function Expenses() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const defaultTab: "all" | "pending" | "paid" =
    filterParam === "pending" || filterParam === "paid" ? filterParam : "all";

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
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useExpenses(filters);
  const { settings } = useUserSettings();
  const { data: groups } = useTemplateGroups();
  const deleteMutation = useDeleteExpense();
  const toggleAmountPaidMutation = useToggleAmountPaid();

  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] =
    useState(false);
  const [expenseForTemplate, setExpenseForTemplate] = useState<Expense | null>(
    null,
  );

  const hasGroups = groups && groups.length > 0;

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

  const handleToggleAmountPaid = async (
    expense: Expense,
    currency: string,
    paid: boolean,
  ) => {
    const toggleId = `${expense.id}-${currency}`;
    setTogglingId(toggleId);
    try {
      await toggleAmountPaidMutation.mutateAsync({ expense, currency, paid });
      toast.success(
        t(paid ? "expenses.markedAsPaid" : "expenses.markedAsPending", {
          currency,
        }),
      );
    } catch (error) {
      toast.error(t("expenses.failedToUpdate"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddDialogOpen(true);
  };

  const handleCreateTemplate = (expense: Expense) => {
    setExpenseForTemplate(expense);
    setIsCreateTemplateDialogOpen(true);
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
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            {!isMobile && (
              <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
                {t("expenses.title")}
              </h2>
            )}
            <div className="text-sm text-gray-600">
              {t("expenses.description")}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {hasGroups && (
              <Button
                variant="outline"
                onClick={() => setIsGroupDialogOpen(true)}
              >
                <Layers className="h-4 w-4" />
                {t("expenses.fromGroup")}
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingExpense(null);
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("expenses.addExpense")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.month")}
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
                  {MONTH_KEYS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
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
              {t("common.year")}
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
                  {t("expenses.exchangeRates")}
                </label>
                <div className="text-xs text-gray-600 rounded-md space-y-1">
                  {isLoadingRates ? (
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3.75 w-full" />
                      <Skeleton className="h-3.75 w-full" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-accent shadow-md rounded-xl overflow-hidden p-0 gap-0">
              <CardHeader className="p-2 grid-rows-1">
                <Skeleton className="h-4 w-62.5" />
                <CardAction>
                  <Skeleton className="h-9 w-9" />
                </CardAction>
              </CardHeader>
              <CardContent className="p-2 flex flex-col gap-2">
                <div className="flex justify-start items-center gap-1">
                  <Skeleton className="h-9 w-18" />
                  <Skeleton className="h-9 w-18" />
                  <Skeleton className="h-9 w-18" />
                </div>
                <Skeleton className="h-15.25 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-30.25 w-full" />
                  <Skeleton className="h-30.25 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 dark:border-accent shadow-md rounded-xl overflow-hidden p-0 gap-0">
              <CardHeader className="p-2 grid-rows-1">
                <Skeleton className="h-4 w-62.5" />
                <CardAction>
                  <Skeleton className="h-9 w-9" />
                </CardAction>
              </CardHeader>
              <CardContent className="p-2 flex flex-col gap-2">
                <div className="flex justify-start items-center gap-1">
                  <Skeleton className="h-9 w-18" />
                  <Skeleton className="h-9 w-18" />
                  <Skeleton className="h-9 w-18" />
                </div>
                <Skeleton className="h-15.25 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-30.25 w-full" />
                  <Skeleton className="h-30.25 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedPeriods.map((period) => (
              <Card
                key={period}
                className="bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md rounded-xl overflow-hidden gap-0"
              >
                <CardHeader className="grid-rows-1">
                  <CardTitle className="flex items-center h-full">
                    {period}
                  </CardTitle>
                  <CardAction>
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingExpense(null);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="p-0">
                  <ExpenseTable
                    expenses={expensesByPeriod[period]}
                    togglingId={togglingId}
                    onToggleAmountPaid={handleToggleAmountPaid}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateTemplate={handleCreateTemplate}
                    defaultTab={defaultTab}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="flex flex-col justify-center items-center gap-2 text-gray-500 mb-4">
              <CircleOff className="h-6 w-6" />
              {t("expenses.noExpenses")}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("expenses.addFirstExpense")}
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
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
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

      <CreateFromGroupDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        paymentPeriods={settings?.payment_periods || []}
      />

      <CreateTemplateDialog
        open={isCreateTemplateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateTemplateDialogOpen(open);
          if (!open) setExpenseForTemplate(null);
        }}
        initialData={
          expenseForTemplate
            ? {
                name: expenseForTemplate.name,
                amounts: expenseForTemplate.amounts.map((a) => ({
                  currency: a.currency,
                  amount: a.amount,
                })),
              }
            : null
        }
      />
    </div>
  );
}
