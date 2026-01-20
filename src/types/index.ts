import type { Database } from "./database";

// Expense Amount interface for multiple currencies per expense
export interface ExpenseAmount {
  currency: string;
  amount: number;
  exchange_rate?: number | null;
  exchange_rate_source?: "api" | "manual" | null;
}

// Base database types
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsertBase = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdateBase = Database["public"]["Tables"]["expenses"]["Update"];

// Override Expense to type amounts as ExpenseAmount[] instead of Json
export interface Expense extends Omit<ExpenseRow, "amounts"> {
  amounts: ExpenseAmount[];
}

export interface ExpenseInsert extends Omit<ExpenseInsertBase, "amounts"> {
  amounts: ExpenseAmount[];
}

export interface ExpenseUpdate extends Omit<ExpenseUpdateBase, "amounts"> {
  amounts?: ExpenseAmount[];
}

export type ExpenseTemplate =
  Database["public"]["Tables"]["expense_templates"]["Row"];
export type ExpenseTemplateInsert =
  Database["public"]["Tables"]["expense_templates"]["Insert"];
export type ExpenseTemplateUpdate =
  Database["public"]["Tables"]["expense_templates"]["Update"];

export type ExchangeRate =
  Database["public"]["Tables"]["exchange_rates"]["Row"];
export type ExchangeRateInsert =
  Database["public"]["Tables"]["exchange_rates"]["Insert"];

// Payment Period interface
export interface PaymentPeriod {
  period: number;
  start_day: number;
  end_day: number;
}

// User Settings - override payment_periods type from Json to PaymentPeriod[]
export interface UserSettings {
  user_id: string;
  primary_currency: string;
  payment_periods: PaymentPeriod[];
  created_at: string | null;
  updated_at: string | null;
}

// For inserts, we keep it flexible
export type UserSettingsInsert = Omit<
  Database["public"]["Tables"]["user_settings"]["Insert"],
  "payment_periods"
> & {
  payment_periods?: PaymentPeriod[];
};
