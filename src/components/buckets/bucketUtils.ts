import { getExchangeRate } from "@/hooks/useExchangeRates";
import type { Expense, ExpenseBucket, ExpenseCategory } from "@/types";
import { t } from "i18next";

export const BUDGET_CURRENCIES = [
  "USD",
  "CRC",
  "COP",
  "MXN",
  "EUR",
  "GBP",
  "JPY",
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CRC: "₡",
  COP: "$",
  MXN: "$",
};

export const getCurrencySymbol = (currency: string): string =>
  CURRENCY_SYMBOLS[currency] || currency;

export const formatBudgetAmount = (amount: number): string =>
  amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export interface BucketBudgetSummary {
  bucket: ExpenseBucket;
  spent: number;
  remaining: number;
  hasAllRates: boolean;
}

const convertAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number> | undefined,
  manualRate?: number | null,
): number | null => {
  if (fromCurrency === toCurrency) return amount;
  if (manualRate) return amount * manualRate;

  const apiRate = getExchangeRate(rates, fromCurrency, toCurrency);
  return apiRate === null ? null : amount * apiRate;
};

export function getBucketBudgetSummaries({
  buckets,
  expenses,
  exchangeRates,
}: {
  buckets: ExpenseBucket[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  exchangeRates: Record<string, number> | undefined;
}): BucketBudgetSummary[] {
  return buckets.map((bucket) => {
    const categoryIds = new Set(bucket.category_ids);
    let spent = 0;
    let hasAllRates = true;

    expenses.forEach((expense) => {
      if (!expense.category_id || !categoryIds.has(expense.category_id)) return;

      expense.amounts.forEach((amountData) => {
        const convertedAmount = convertAmount(
          amountData.amount,
          amountData.currency,
          bucket.currency,
          exchangeRates,
          amountData.exchange_rate,
        );

        if (convertedAmount === null) {
          hasAllRates = false;
          return;
        }

        spent += convertedAmount;
      });
    });

    return {
      bucket,
      spent,
      remaining: bucket.monthly_budget - spent,
      hasAllRates,
    };
  });
}

export function getTotalsByCurrency(
  summaries: BucketBudgetSummary[],
): BucketBudgetSummary | null {
  if (summaries.length === 0) return null;

  const bucket = {
    category_ids: [],
    created_at: null,
    id: "totals",
    name: t("buckets.total"),
    updated_at: null,
    user_id: "",
    currency: summaries[0].bucket.currency,
    monthly_budget: summaries.reduce(
      (sum, s) => sum + s.bucket.monthly_budget,
      0,
    ),
  };
  const spent = summaries.reduce((sum, s) => sum + s.spent, 0);
  const remaining = summaries.reduce((sum, s) => sum + s.remaining, 0);

  return { bucket, spent, remaining, hasAllRates: true };
}
