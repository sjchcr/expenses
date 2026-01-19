import type { Database } from "./database";

// Use the database types as base
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

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
