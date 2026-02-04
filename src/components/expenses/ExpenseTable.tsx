import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import {
  Trash2,
  Edit,
  Sigma,
  CircleDashed,
  CircleCheck,
  CircleOff,
  Loader2,
  EllipsisVertical,
  FilePlusCorner,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Expense } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useExchangeRates, getExchangeRate } from "@/hooks/useExchangeRates";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CRC: "₡",
  COP: "$",
  MXN: "$",
};

const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

const formatAmount = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Get total amount for sorting (sum of all amounts)
const getTotalAmount = (expense: Expense): number => {
  return expense.amounts.reduce((sum, a) => sum + a.amount, 0);
};

interface ExpenseTableProps {
  expenses: Expense[];
  togglingId: string | null;
  onToggleAmountPaid: (
    expense: Expense,
    currency: string,
    paid: boolean,
  ) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onCreateTemplate: (expense: Expense) => void;
  defaultTab?: "all" | "pending" | "paid";
}

// Helper to check if all amounts in an expense are paid
const isExpenseFullyPaid = (expense: Expense): boolean => {
  return expense.amounts.every((a) => a.paid);
};

// Helper to check if any amount in an expense is paid
const isExpensePartiallyPaid = (expense: Expense): boolean => {
  return expense.amounts.some((a) => a.paid) && !isExpenseFullyPaid(expense);
};

export function ExpenseTable({
  expenses,
  togglingId,
  onToggleAmountPaid,
  onEdit,
  onDelete,
  onCreateTemplate,
  defaultTab = "all",
}: ExpenseTableProps) {
  const { t } = useTranslation();
  const [sortColumn] = useState<string | null>("due_date");
  const [sortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "paid">(
    defaultTab,
  );

  const filterExpenses = (items: Expense[]) => {
    switch (activeTab) {
      case "pending":
        return items.filter((e) => !isExpenseFullyPaid(e));
      case "paid":
        return items.filter((e) => isExpenseFullyPaid(e));
      default:
        return items;
    }
  };

  const sortExpenses = (items: Expense[]) => {
    return [...items].sort((a, b) => {
      if (!sortColumn) return 0;

      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "amount":
          aValue = getTotalAmount(a);
          bValue = getTotalAmount(b);
          break;
        case "due_date":
          aValue = parseISO(a.due_date).getTime();
          bValue = parseISO(b.due_date).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredExpenses = filterExpenses(expenses);
  const sortedExpenses = sortExpenses(filteredExpenses);

  // Get all unique currencies from all expenses
  const allCurrencies = useMemo(
    () =>
      Array.from(
        new Set(expenses.flatMap((e) => e.amounts.map((a) => a.currency))),
      ),
    [expenses],
  );

  // Fetch exchange rates from API for currencies without manual rates
  const { data: fetchedRates, isLoading: isLoadingRates } =
    useExchangeRates(allCurrencies);

  // Calculate totals by currency (supports multiple amounts per expense)
  const totals = expenses.reduce((acc, expense) => {
    for (const { currency, amount, paid } of expense.amounts) {
      if (!acc[currency]) {
        acc[currency] = { total: 0, paid: 0, pending: 0 };
      }
      acc[currency].total += amount;
      if (paid) {
        acc[currency].paid += amount;
      } else {
        acc[currency].pending += amount;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; paid: number; pending: number }>);

  // Calculate grand totals by converting all amounts to each target currency
  const grandTotals = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      // For each target currency, sum up all amounts converted using exchange rates
      for (const targetCurrency of allCurrencies) {
        if (!acc[targetCurrency]) {
          acc[targetCurrency] = {
            total: 0,
            paid: 0,
            pending: 0,
            hasAllRates: true,
          };
        }

        for (const amountData of expense.amounts) {
          let convertedAmount: number;

          if (amountData.currency === targetCurrency) {
            // Same currency, no conversion needed
            convertedAmount = amountData.amount;
          } else if (amountData.exchange_rate) {
            // Use manual exchange rate from the expense
            convertedAmount = amountData.amount * amountData.exchange_rate;
          } else {
            // Try to get rate from API-fetched rates
            const apiRate = getExchangeRate(
              fetchedRates,
              amountData.currency,
              targetCurrency,
            );
            if (apiRate !== null) {
              convertedAmount = amountData.amount * apiRate;
            } else {
              // No exchange rate available, mark as incomplete
              acc[targetCurrency].hasAllRates = false;
              continue;
            }
          }

          acc[targetCurrency].total += convertedAmount;
          if (amountData.paid) {
            acc[targetCurrency].paid += convertedAmount;
          } else {
            acc[targetCurrency].pending += convertedAmount;
          }
        }
      }
      return acc;
    }, {} as Record<string, { total: number; paid: number; pending: number; hasAllRates: boolean }>);
  }, [expenses, allCurrencies, fetchedRates]);

  const renderExpenseList = (tab: string) => (
    <>
      {sortedExpenses.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-6 text-sm text-gray-500">
          <CircleOff className="h-6 w-6" />
          {tab === "all"
            ? t("expenses.noExpenses")
            : t("expenses.noExpensesTab", { tab: t(`common.${tab}`) })}
        </div>
      ) : (
        sortedExpenses.map((expense, index) => {
          const daysLeft = Math.ceil(
            (parseISO(expense.due_date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const fullyPaid = isExpenseFullyPaid(expense);
          const partiallyPaid = isExpensePartiallyPaid(expense);
          return (
            <div
              key={expense.id}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 hover:bg-primary/5",
                index !== sortedExpenses.length - 1 &&
                  "border-b border-gray-200 dark:border-accent",
              )}
            >
              <div className="w-full flex items-center justify-start gap-1">
                <div className="w-full flex flex-col justify-start items-center gap-1">
                  <div className="w-full flex justify-start items-center gap-1">
                    {fullyPaid ? (
                      <Badge variant="success" className="gap-1">
                        <CircleCheck className="h-3 w-3 shrink-0" />
                        {t("common.paid")}
                      </Badge>
                    ) : partiallyPaid ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-500 text-amber-600"
                      >
                        <CircleDashed className="h-3 w-3 shrink-0" />
                        {t("expenses.partial")}
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <CircleDashed className="h-3 w-3 shrink-0" />
                        {daysLeft >= 0 ? `${daysLeft}d` : t("expenses.overdue")}
                      </Badge>
                    )}
                    <p
                      className={cn(
                        "text-sm font-bold truncate",
                        fullyPaid
                          ? "text-green-600"
                          : partiallyPaid
                          ? "text-amber-600"
                          : "text-amber-500",
                      )}
                    >
                      {expense.name}
                    </p>
                  </div>
                  <div className="w-full flex justify-between items-center gap-2">
                    <div
                      className={cn(
                        "w-full grid items-center gap-4 text-sm text-gray-900",
                        `grid-cols-${allCurrencies.length}`,
                      )}
                    >
                      {allCurrencies.map((currency) => {
                        const amountData = expense.amounts.find(
                          (a) => a.currency === currency,
                        );

                        // Show simple format if currency not in this expense
                        if (!amountData) {
                          return (
                            <span
                              key={currency}
                              className="flex justify-start items-center gap-1.5 text-accent-foreground/50 px-1 py-0.5 col-span-1"
                            >
                              <Checkbox
                                checked={false}
                                disabled
                                className="h-3.5 w-3.5"
                              />
                              {getCurrencySymbol(currency)}-
                            </span>
                          );
                        }

                        const isToggling =
                          togglingId === `${expense.id}-${amountData.currency}`;

                        return (
                          <div
                            key={amountData.currency}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAmountPaid(
                                expense,
                                amountData.currency,
                                !amountData.paid,
                              );
                            }}
                            className={cn(
                              "col-span-1 flex justify-start items-center gap-1.5 cursor-pointer rounded px-1 py-0.5 transition-colors  w-full",
                              amountData.paid
                                ? "text-green-600"
                                : "text-accent-foreground",
                            )}
                          >
                            {isToggling ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <Checkbox
                                checked={amountData.paid}
                                className="h-3.5 w-3.5"
                              />
                            )}
                            <span
                              className={cn(
                                amountData.paid && "line-through opacity-70",
                              )}
                            >
                              {getCurrencySymbol(amountData.currency)}
                              {formatAmount(amountData.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-accent-foreground w-20">
                      {format(parseISO(expense.due_date), "MM/dd")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-15 flex justify-end gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(expense);
                        }}
                      >
                        <Edit />
                        {t("expenses.editExpense")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTemplate(expense);
                        }}
                      >
                        <FilePlusCorner />
                        {t("templates.createTemplate")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(expense);
                        }}
                      >
                        <Trash2 />
                        {t("expenses.deleteExpense")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })
      )}
    </>
  );

  return (
    <div className="w-full h-[calc(100%-52px)] flex flex-col justify-between">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "all" | "pending" | "paid")}
        className="w-full"
      >
        <TabsList background={false} className="mx-4 gap-1">
          <TabsTrigger variant="outline" value="all" className="flex-1 gap-1">
            <Sigma className="w-3 h-3" />
            {t("common.all")}
          </TabsTrigger>
          <TabsTrigger
            variant="warning"
            value="pending"
            className="flex-1 gap-1"
          >
            <CircleDashed className="w-3 h-3" />
            {t("common.pending")}
          </TabsTrigger>
          <TabsTrigger variant="success" value="paid" className="flex-1 gap-1">
            <CircleCheck className="w-3 h-3" />
            {t("common.paid")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderExpenseList("all")}</TabsContent>
        <TabsContent value="pending">
          {renderExpenseList("pending")}
        </TabsContent>
        <TabsContent value="paid">{renderExpenseList("paid")}</TabsContent>
      </Tabs>
      <div className="border-t w-full flex gap-8 p-4 pb-0">
        {Object.entries(totals).map(([currency, values]) => (
          <div key={currency} className="flex flex-col text-sm w-full">
            <h4 className="font-semibold text-gray-800 dark:text-accent-foreground/80 mb-1">
              {currency}
            </h4>
            <div className="flex flex-col w-full text-sm">
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <Sigma className="w-3 h-3" />
                  {t("common.total")}:
                </span>
                <span className="text-accent-foreground/50">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.total)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleCheck className="w-3 h-3" />
                  {t("common.paid")}:
                </span>
                <span className="text-green-600">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.paid)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleDashed className="w-3 h-3" />
                  {t("common.pending")}:
                </span>
                <span className="text-yellow-600">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.pending)}
                </span>
              </div>
              {grandTotals[currency] && allCurrencies.length > 1 && (
                <div className="flex justify-between gap-2 w-full mt-2 pt-2 border-t border-dashed">
                  <span className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
                    {t("expenses.grandTotal")}:
                  </span>
                  <span className="text-blue-700 dark:text-blue-400">
                    {isLoadingRates ? (
                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                    ) : grandTotals[currency].hasAllRates ? (
                      <>
                        {getCurrencySymbol(currency)}
                        {formatAmount(grandTotals[currency].total)}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        {t("expenses.missingRates")}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
