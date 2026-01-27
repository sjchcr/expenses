import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses.service";
import type { Expense, ExpenseInsert, ExpenseUpdate } from "@/types";

export function useExpenses(filters?: {
  startDate?: string;
  endDate?: string;
  currency?: string;
  isPaid?: boolean;
}) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => expensesService.getExpenses(filters),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: Omit<ExpenseInsert, "user_id">) =>
      expensesService.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExpenseUpdate }) =>
      expensesService.updateExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useTogglePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      expensesService.togglePaid(id, isPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useToggleAmountPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expense,
      currency,
      paid,
    }: {
      expense: Expense;
      currency: string;
      paid: boolean;
    }) => expensesService.toggleAmountPaid(expense, currency, paid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
