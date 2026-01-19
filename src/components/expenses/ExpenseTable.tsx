import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Trash2,
  Edit,
  Loader,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sigma,
  CircleDashed,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/types";

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
  const [sortColumn, setSortColumn] = useState<string | null>("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = ["name", "amount", "due_date", "status"];

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "amount":
        aValue = a.amount;
        bValue = b.amount;
        break;
      case "currency":
        aValue = a.currency;
        bValue = b.currency;
        break;
      case "due_date":
        aValue = new Date(a.due_date).getTime();
        bValue = new Date(b.due_date).getTime();
        break;
      case "status":
        aValue = a.is_paid ? 1 : 0;
        bValue = b.is_paid ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate totals by currency
  const totals = expenses.reduce(
    (acc, expense) => {
      if (!acc[expense.currency]) {
        acc[expense.currency] = { total: 0, paid: 0, pending: 0 };
      }
      acc[expense.currency].total += expense.amount;
      if (expense.is_paid) {
        acc[expense.currency].paid += expense.amount;
      } else {
        acc[expense.currency].pending += expense.amount;
      }
      return acc;
    },
    {} as Record<string, { total: number; paid: number; pending: number }>,
  );

  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-center gap-2 p-2 pr-19 border-b border-gray-200">
        {columns.map((column) => (
          <div
            key={column}
            className="flex items-center gap-1 w-full"
            onClick={() => handleSort(column)}
          >
            <span className="truncate text-sm font-medium text-gray-700 cursor-pointer">
              {column.charAt(0).toUpperCase() + column.slice(1)}
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
      {sortedExpenses.map((expense) => (
        <div
          key={expense.id}
          className="w-full flex items-center justify-center gap-2 p-2 bg-transparent hover:bg-primary/5"
        >
          <div className="w-full">
            <div className="text-sm font-medium text-gray-900 truncate max-w-37.5">
              {expense.name}
            </div>
          </div>
          <div className="w-full">
            <div className="text-sm text-gray-900">
              {getCurrencySymbol(expense.currency)}
              {expense.amount.toFixed(2)}
            </div>
          </div>
          <div className="w-full">
            <div className="text-sm text-gray-900">
              {format(parseISO(expense.due_date), "MM/dd")}
            </div>
          </div>
          <div className="w-full">
            {togglingExpenseId === expense.id ? (
              <Loader className="h-4 w-4 animate-spin text-gray-600" />
            ) : (
              <Badge
                variant={expense.is_paid ? "success" : "warning"}
                className="cursor-pointer text-xs"
                onClick={() =>
                  onTogglePaid(expense.id, expense.is_paid || false)
                }
              >
                {expense.is_paid ? "Paid" : "Pending"}
              </Badge>
            )}
          </div>
          <div className="w-15 flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(expense)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(expense)}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
      <div className="border-t flex gap-8 p-2">
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
                  {values.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleCheck className="w-3 h-3" />
                  Paid:
                </span>
                <span className="text-green-600">
                  {getCurrencySymbol(currency)}
                  {values.paid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                <span className="flex items-center gap-1 font-medium">
                  <CircleDashed className="w-3 h-3" />
                  Pending:
                </span>
                <span className="text-yellow-600">
                  {getCurrencySymbol(currency)}
                  {values.pending.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
