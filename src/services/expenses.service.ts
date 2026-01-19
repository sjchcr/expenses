import { supabase } from "@/lib/supabase";
import type { Expense, ExpenseInsert, ExpenseUpdate } from "@/types";
import { format } from "date-fns";

export const expensesService = {
  async getExpenses(filters?: {
    startDate?: string;
    endDate?: string;
    currency?: string;
    isPaid?: boolean;
  }) {
    let query = supabase
      .from("expenses")
      .select("*")
      .order("due_date", { ascending: true });

    if (filters?.startDate) {
      query = query.gte("due_date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("due_date", filters.endDate);
    }
    if (filters?.currency) {
      query = query.eq("currency", filters.currency);
    }
    if (filters?.isPaid !== undefined) {
      query = query.eq("is_paid", filters.isPaid);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Expense[];
  },

  async createExpense(expense: Omit<ExpenseInsert, "user_id">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        ...expense,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async updateExpense(id: string, updates: ExpenseUpdate) {
    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
  },

  async togglePaid(id: string, isPaid: boolean) {
    return this.updateExpense(id, { is_paid: isPaid });
  },

  // Calculate payment period for a date
  getPaymentPeriod(date: Date, periods: any[]): string {
    const day = date.getDate();
    const yearMonth = format(date, "yyyy-MM");

    for (const period of periods) {
      if (day >= period.start_day && day <= period.end_day) {
        return `${yearMonth}-${period.period}`;
      }
    }

    return `${yearMonth}-1`;
  },
};
