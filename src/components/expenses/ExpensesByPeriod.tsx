import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseTable } from "./ExpenseTable";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types";

interface ExpensesByPeriodProps {
  expensesByPeriod: Record<string, Expense[]>;
  sortedPeriods: string[];
  togglingId: string | null;
  defaultTab: "all" | "pending" | "paid";
  onToggleAmountPaid: (
    expense: Expense,
    currency: string,
    paid: boolean,
  ) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onCreateTemplate: (expense: Expense) => void;
  onAddExpense: () => void;
}

export function ExpensesByPeriod({
  expensesByPeriod,
  sortedPeriods,
  togglingId,
  defaultTab,
  onToggleAmountPaid,
  onEdit,
  onDelete,
  onCreateTemplate,
  onAddExpense,
}: ExpensesByPeriodProps) {
  const isMobile = useMobile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {sortedPeriods.map((period) => (
        <Card
          key={period}
          className={cn(
            "bg-linear-to-b from-background to-accent dark:bg-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden",
            isMobile ? "gap-4" : "gap-0",
          )}
        >
          <CardHeader className="grid-rows-1">
            <CardTitle className="flex items-center h-full">{period}</CardTitle>
            {!isMobile && (
              <CardAction>
                <Button size="icon" onClick={onAddExpense}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ExpenseTable
              expenses={expensesByPeriod[period]}
              togglingId={togglingId}
              onToggleAmountPaid={onToggleAmountPaid}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateTemplate={onCreateTemplate}
              defaultTab={defaultTab}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
