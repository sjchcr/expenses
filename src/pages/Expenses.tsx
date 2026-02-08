import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Plus, LayersPlus } from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  useDeleteExpense,
  useToggleAmountPaid,
} from "@/hooks/useExpenses";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useTemplateGroups } from "@/hooks/useTemplateGroups";
import { useMobile } from "@/hooks/useMobile";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import {
  AddExpenseDialog,
  CreateFromGroupDialog,
  DeleteExpenseDialog,
  ExpensesHeader,
  ExpensesFilters,
  ExpensesByPeriod,
  ExpensesLoadingSkeleton,
  ExpensesEmptyState,
} from "@/components/expenses";
import type { Expense } from "@/types";

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
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] =
    useState(false);
  const [expenseForTemplate, setExpenseForTemplate] = useState<Expense | null>(
    null,
  );

  const { data: expenses, isLoading, refetch } = useExpenses(filters);
  const { settings } = useUserSettings();
  const { data: groups } = useTemplateGroups();
  const deleteMutation = useDeleteExpense();
  const toggleAmountPaidMutation = useToggleAmountPaid();

  const hasGroups = groups && groups.length > 0;

  const availableCurrencies = useMemo(() => {
    if (!expenses) return [];
    return Array.from(
      new Set(expenses.flatMap((e) => e.amounts.map((a) => a.currency))),
    );
  }, [expenses]);

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
    } catch {
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

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsAddDialogOpen(true);
  };

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

  const sortedPeriods = Object.keys(expensesByPeriod).sort();

  const buttons: HeaderActionsGroups[] = [
    {
      group: "expenses",
      type: "dropdown",
      icon: Plus,
      actions: [
        {
          label: t("expenses.addExpense"),
          icon: Plus,
          onClick: handleAddExpense,
        },
        {
          label: t("expenses.fromGroup"),
          icon: LayersPlus,
          onClick: () => setIsGroupDialogOpen(true),
        },
      ],
    },
  ];

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      <ExpensesHeader
        hasGroups={hasGroups ?? false}
        onAddExpense={handleAddExpense}
        onFromGroup={() => setIsGroupDialogOpen(true)}
      />

      <ExpensesFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onPrevYear={handlePrevYear}
        onNextYear={handleNextYear}
        availableCurrencies={availableCurrencies}
        exchangeRates={exchangeRates}
        isLoadingRates={isLoadingRates}
      />

      {isLoading ? (
        <ExpensesLoadingSkeleton />
      ) : expenses && expenses.length > 0 ? (
        <ExpensesByPeriod
          expensesByPeriod={expensesByPeriod}
          sortedPeriods={sortedPeriods}
          togglingId={togglingId}
          defaultTab={defaultTab}
          onToggleAmountPaid={handleToggleAmountPaid}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateTemplate={handleCreateTemplate}
          onAddExpense={handleAddExpense}
        />
      ) : (
        <ExpensesEmptyState onAddExpense={handleAddExpense} />
      )}
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader actions={buttons} title={t("expenses.title")} />
      )}
      {isMobile ? (
        <PullToRefresh onRefresh={async () => { await refetch(); }}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}

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
