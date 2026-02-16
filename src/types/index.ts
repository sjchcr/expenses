import type { Database } from "./database";

// Expense Amount interface for multiple currencies per expense
export interface ExpenseAmount {
  currency: string;
  amount: number;
  exchange_rate?: number | null;
  exchange_rate_source?: "api" | "manual" | null;
  paid?: boolean;
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
  language: string;
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

// Template Group types
type TemplateGroupRow =
  Database["public"]["Tables"]["template_groups"]["Row"];
type TemplateGroupInsertBase =
  Database["public"]["Tables"]["template_groups"]["Insert"];
type TemplateGroupUpdateBase =
  Database["public"]["Tables"]["template_groups"]["Update"];

export interface TemplateGroup extends Omit<TemplateGroupRow, "template_ids"> {
  template_ids: string[];
}

export interface TemplateGroupInsert
  extends Omit<TemplateGroupInsertBase, "template_ids"> {
  template_ids: string[];
}

export interface TemplateGroupUpdate
  extends Omit<TemplateGroupUpdateBase, "template_ids"> {
  template_ids?: string[];
}

// Salary types
export type Salary = Database["public"]["Tables"]["salaries"]["Row"];
export type SalaryInsert = Database["public"]["Tables"]["salaries"]["Insert"];
export type SalaryUpdate = Database["public"]["Tables"]["salaries"]["Update"];

// Stock Deduction interface for custom deductions stored as JSONB
export interface StockDeduction {
  id: string;
  name: string;
  type: "percentage" | "nominal";
  amount: number; // percentage as decimal (0.15 = 15%), nominal as USD
}

// Stocks Settings types
// Tax percentages are stored as decimals (e.g., 0.30 = 30%)
type StocksSettingsRow =
  Database["public"]["Tables"]["stocks_settings"]["Row"];
type StocksSettingsInsertBase =
  Database["public"]["Tables"]["stocks_settings"]["Insert"];
type StocksSettingsUpdateBase =
  Database["public"]["Tables"]["stocks_settings"]["Update"];

export interface StocksSettings
  extends Omit<StocksSettingsRow, "other_deductions"> {
  other_deductions: StockDeduction[];
}

export interface StocksSettingsInsert
  extends Omit<StocksSettingsInsertBase, "other_deductions"> {
  other_deductions?: StockDeduction[];
}

export interface StocksSettingsUpdate
  extends Omit<StocksSettingsUpdateBase, "other_deductions"> {
  other_deductions?: StockDeduction[];
}

// Stock Period types
export type StockPeriod = Database["public"]["Tables"]["stock_periods"]["Row"];
export type StockPeriodInsert =
  Database["public"]["Tables"]["stock_periods"]["Insert"];
export type StockPeriodUpdate =
  Database["public"]["Tables"]["stock_periods"]["Update"];

// Stock calculation result types
export interface StockPeriodBreakdown {
  grossUsd: number;
  usTaxUsd: number;
  afterUsTaxUsd: number;
  localTaxUsd: number;
  brokerCostUsd: number;
  otherDeductions: { name: string; type: "percentage" | "nominal"; rate: number; amount: number }[];
  otherDeductionsUsd: number;
  netUsd: number;
  warning?: string;
}

export interface StockYearTotals {
  grossUsd: number;
  usTaxUsd: number;
  localTaxUsd: number;
  brokerCostUsd: number;
  otherDeductionsUsd: number;
  netUsd: number;
  periodCount: number;
}
