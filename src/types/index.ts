import type { Database } from "./database";

// Expense Amount interface for multiple currencies per expense
export interface ExpenseAmount {
  currency: string;
  amount: number;
  exchange_rate?: number | null;
  exchange_rate_source?: "api" | "manual" | null;
}

// Template Amount interface (amount is optional for templates)
export interface TemplateAmount {
  currency: string;
  amount?: number | null;
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

// Base template types from database
type ExpenseTemplateRow =
  Database["public"]["Tables"]["expense_templates"]["Row"];
type ExpenseTemplateInsertBase =
  Database["public"]["Tables"]["expense_templates"]["Insert"];
type ExpenseTemplateUpdateBase =
  Database["public"]["Tables"]["expense_templates"]["Update"];

// Override ExpenseTemplate to type amounts as TemplateAmount[] instead of Json
export interface ExpenseTemplate extends Omit<ExpenseTemplateRow, "amounts"> {
  amounts: TemplateAmount[];
}

export interface ExpenseTemplateInsert
  extends Omit<ExpenseTemplateInsertBase, "amounts"> {
  amounts: TemplateAmount[];
}

export interface ExpenseTemplateUpdate
  extends Omit<ExpenseTemplateUpdateBase, "amounts"> {
  amounts?: TemplateAmount[];
}

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
