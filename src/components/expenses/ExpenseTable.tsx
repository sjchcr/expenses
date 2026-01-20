import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Trash2,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sigma,
  CircleDashed,
  CircleCheck,
  CircleOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Expense } from "@/types";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { useExchangeRates, getExchangeRate } from "@/hooks/useExchangeRates";

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
  togglingExpenseId: string | null;
  onTogglePaid: (id: string, currentStatus: boolean) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses,
  togglingExpenseId,
  onTogglePaid,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("all");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = ["name", "amount", "due_date"];

  const filterExpenses = (items: Expense[]) => {
    switch (activeTab) {
      case "pending":
        return items.filter((e) => !e.is_paid);
      case "paid":
        return items.filter((e) => e.is_paid);
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
    () => Array.from(new Set(expenses.flatMap((e) => e.amounts.map((a) => a.currency)))),
    [expenses],
  );

  // Fetch exchange rates from API for currencies without manual rates
  const { data: fetchedRates, isLoading: isLoadingRates } = useExchangeRates(allCurrencies);

  // Calculate totals by currency (supports multiple amounts per expense)
  const totals = expenses.reduce(
    (acc, expense) => {
      for (const { currency, amount } of expense.amounts) {
        if (!acc[currency]) {
          acc[currency] = { total: 0, paid: 0, pending: 0 };
        }
        acc[currency].total += amount;
        if (expense.is_paid) {
          acc[currency].paid += amount;
        } else {
          acc[currency].pending += amount;
        }
      }
      return acc;
    },
    {} as Record<string, { total: number; paid: number; pending: number }>,
  );

  // Calculate grand totals by converting all amounts to each target currency
  const grandTotals = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        // For each target currency, sum up all amounts converted using exchange rates
        for (const targetCurrency of allCurrencies) {
          if (!acc[targetCurrency]) {
            acc[targetCurrency] = { total: 0, paid: 0, pending: 0, hasAllRates: true };
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
              const apiRate = getExchangeRate(fetchedRates, amountData.currency, targetCurrency);
              if (apiRate !== null) {
                convertedAmount = amountData.amount * apiRate;
              } else {
                // No exchange rate available, mark as incomplete
                acc[targetCurrency].hasAllRates = false;
                continue;
              }
            }

            acc[targetCurrency].total += convertedAmount;
            if (expense.is_paid) {
              acc[targetCurrency].paid += convertedAmount;
            } else {
              acc[targetCurrency].pending += convertedAmount;
            }
          }
        }
        return acc;
      },
      {} as Record<string, { total: number; paid: number; pending: number; hasAllRates: boolean }>,
    );
  }, [expenses, allCurrencies, fetchedRates]);

  const renderExpenseList = (tab: string) => (
    <>
      <div className="w-full flex items-center justify-center gap-2 p-2 pr-19 border-b border-gray-200">
        {columns.map((column) => (
          <div
            key={column}
            className="flex items-center gap-1 w-full"
            onClick={() => handleSort(column)}
          >
            <span className="truncate text-sm font-medium text-gray-700 cursor-pointer">
              {column === "due_date"
                ? "Due Date"
                : column.charAt(0).toUpperCase() + column.slice(1)}
            </span>
            {sortColumn === column ? (
              sortDirection === "asc" ? (
                <ArrowUp className="w-3 h-3 shrink-0" />
              ) : (
                <ArrowDown className="w-3 h-3 shrink-0" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 text-gray-300 shrink-0" />
            )}
          </div>
        ))}
      </div>
      {sortedExpenses.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-6 text-sm text-gray-500">
          <CircleOff className="h-6 w-6" />
          No {tab !== "all" && tab} expenses found
        </div>
      ) : (
        sortedExpenses.map((expense) => (
          <div
            key={expense.id}
            onClick={() => onTogglePaid(expense.id, expense.is_paid || false)}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-2 cursor-pointer",
              expense.is_paid
                ? "bg-green-600/5 hover:bg-green-600/20"
                : "bg-amber-600/5 hover:bg-amber-600/20",
            )}
          >
            <div className="w-full flex items-center justify-start gap-1">
              {togglingExpenseId === expense.id ? (
                <Spinner className="h-3 w-3 text-gray-500" />
              ) : expense.is_paid ? (
                <CircleCheck className="h-3 w-3 text-green-600 shrink-0" />
              ) : (
                <CircleDashed className="h-3 w-3 text-yellow-600 shrink-0" />
              )}
              <p className="text-sm font-medium text-gray-900 truncate max-w-37.5">
                {expense.name}
              </p>
            </div>
            <div className="w-full">
              <div className="w-full flex justify-start items-center gap-4 text-sm text-gray-900">
                {allCurrencies.map((currency) => {
                  const amountData = expense.amounts.find(
                    (a) => a.currency === currency,
                  );
                  return (
                    <div
                      key={currency}
                      className="flex justify-start items-center gap-1 w-1/2"
                    >
                      <span>{getCurrencySymbol(currency)}</span>
                      <span className={!amountData ? "text-gray-400" : ""}>
                        {amountData ? formatAmount(amountData.amount) : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="w-full">
              <div className="text-sm text-gray-900">
                {format(parseISO(expense.due_date), "MM/dd")}
              </div>
            </div>
            <div className="w-15 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(expense);
                }}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(expense);
                }}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          </div>
        ))
      )}
    </>
  );

  return (
    <div className="w-full h-[calc(100%-44px)] flex flex-col justify-between">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList background={false} className="mx-2 gap-1">
          <TabsTrigger variant="outline" value="all" className="flex-1 gap-1">
            <Sigma className="w-3 h-3" />
            All
          </TabsTrigger>
          <TabsTrigger
            variant="warning"
            value="pending"
            className="flex-1 gap-1"
          >
            <CircleDashed className="w-3 h-3" />
            Pending
          </TabsTrigger>
          <TabsTrigger variant="success" value="paid" className="flex-1 gap-1">
            <CircleCheck className="w-3 h-3" />
            Paid
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderExpenseList("all")}</TabsContent>
        <TabsContent value="pending">
          {renderExpenseList("pending")}
        </TabsContent>
        <TabsContent value="paid">{renderExpenseList("paid")}</TabsContent>
      </Tabs>
      <div className="border-t w-full flex gap-8 p-2">
        {Object.entries(totals).map(([currency, values]) => (
          <div key={currency} className="flex flex-col text-sm w-full">
            <h4 className="font-semibold text-gray-800 mb-1">{currency}</h4>
            <div className="flex flex-col w-full text-sm">
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <Sigma className="w-3 h-3" />
                  Total:
                </span>
                <span className="text-gray-600">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.total)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleCheck className="w-3 h-3" />
                  Paid:
                </span>
                <span className="text-green-600">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.paid)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleDashed className="w-3 h-3" />
                  Pending:
                </span>
                <span className="text-yellow-600">
                  {getCurrencySymbol(currency)}
                  {formatAmount(values.pending)}
                </span>
              </div>
              {grandTotals[currency] && allCurrencies.length > 1 && (
                <div className="flex justify-between gap-2 w-full mt-2 pt-2 border-t border-dashed">
                  <span className="flex items-center gap-1 font-medium text-blue-700">
                    Grand Total:
                  </span>
                  <span className="text-blue-700">
                    {isLoadingRates ? (
                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                    ) : grandTotals[currency].hasAllRates ? (
                      <>
                        {getCurrencySymbol(currency)}
                        {formatAmount(grandTotals[currency].total)}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Missing rates
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
