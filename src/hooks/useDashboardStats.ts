import { useMemo } from "react";
import { useExpenses } from "./useExpenses";
import { useExchangeRates } from "./useExchangeRates";
import { useUserSettings } from "./useUserSettings";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type { Expense, ExpenseAmount } from "@/types";

export interface CurrencyTotal {
  currency: string;
  total: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  monthLabel: string;
  totals: Record<string, number>;
}

export interface MonthComparison {
  currency: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
}

export interface ExchangeRateDisplay {
  from: string;
  to: string;
  rate: number;
}

export function useDashboardStats() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  // Determine the earliest date we need (either year start or previous month, whichever is earlier)
  // This handles the case where previous month is in the prior year (e.g., Dec when current is Jan)
  const queryStartDate =
    previousMonthStart < yearStart ? previousMonthStart : yearStart;

  // Fetch expenses from the earliest needed date through end of current year
  const { data: allExpenses, isLoading: expensesLoading } = useExpenses({
    startDate: format(queryStartDate, "yyyy-MM-dd"),
    endDate: format(yearEnd, "yyyy-MM-dd"),
  });

  // Filter to only current year expenses for year-based calculations
  const yearExpenses = useMemo(() => {
    if (!allExpenses) return [];
    return allExpenses.filter((expense) => {
      const dueDate = parseISO(expense.due_date);
      return isWithinInterval(dueDate, { start: yearStart, end: yearEnd });
    });
  }, [allExpenses, yearStart, yearEnd]);

  const { settings, isLoading: settingsLoading } = useUserSettings();

  // Get all unique currencies from expenses
  const currencies = useMemo(() => {
    if (!yearExpenses) return [];
    const currencySet = new Set<string>();
    yearExpenses.forEach((expense) => {
      expense.amounts.forEach((amount: ExpenseAmount) => {
        currencySet.add(amount.currency);
      });
    });
    return Array.from(currencySet);
  }, [yearExpenses]);

  const { data: exchangeRates, isLoading: ratesLoading } =
    useExchangeRates(currencies);

  // Calculate pending payments for current month (per currency)
  const pendingPayments = useMemo((): CurrencyTotal[] => {
    if (!yearExpenses) return [];

    const currencyTotals: Record<string, { total: number; count: number }> = {};

    yearExpenses
      .filter((expense: Expense) => {
        if (expense.is_paid) return false;
        const dueDate = parseISO(expense.due_date);
        return isWithinInterval(dueDate, {
          start: currentMonthStart,
          end: currentMonthEnd,
        });
      })
      .forEach((expense: Expense) => {
        expense.amounts.forEach((amount: ExpenseAmount) => {
          if (!currencyTotals[amount.currency]) {
            currencyTotals[amount.currency] = { total: 0, count: 0 };
          }
          currencyTotals[amount.currency].total += amount.amount;
          currencyTotals[amount.currency].count += 1;
        });
      });

    return Object.entries(currencyTotals)
      .map(([currency, data]) => ({
        currency,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [yearExpenses, currentMonthStart, currentMonthEnd]);

  // Calculate month-over-month comparison (uses allExpenses to include previous month from prior year)
  const monthComparison = useMemo((): MonthComparison[] => {
    if (!allExpenses) return [];

    const currentTotals: Record<string, number> = {};
    const previousTotals: Record<string, number> = {};

    allExpenses.forEach((expense: Expense) => {
      const dueDate = parseISO(expense.due_date);

      const isCurrentMonth = isWithinInterval(dueDate, {
        start: currentMonthStart,
        end: currentMonthEnd,
      });

      const isPreviousMonth = isWithinInterval(dueDate, {
        start: previousMonthStart,
        end: previousMonthEnd,
      });

      if (isCurrentMonth || isPreviousMonth) {
        expense.amounts.forEach((amount: ExpenseAmount) => {
          if (isCurrentMonth) {
            currentTotals[amount.currency] =
              (currentTotals[amount.currency] || 0) + amount.amount;
          }
          if (isPreviousMonth) {
            previousTotals[amount.currency] =
              (previousTotals[amount.currency] || 0) + amount.amount;
          }
        });
      }
    });

    const allCurrencies = new Set([
      ...Object.keys(currentTotals),
      ...Object.keys(previousTotals),
    ]);

    return Array.from(allCurrencies)
      .map((currency) => {
        const current = currentTotals[currency] || 0;
        const previous = previousTotals[currency] || 0;
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : 0;

        return {
          currency,
          currentMonth: current,
          previousMonth: previous,
          change,
          changePercent,
        };
      })
      .sort((a, b) => b.currentMonth - a.currentMonth);
  }, [
    allExpenses,
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
  ]);

  // Calculate monthly spending trends for the year
  const monthlyTrends = useMemo((): MonthlyData[] => {
    if (!yearExpenses) return [];

    const months: MonthlyData[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const totals: Record<string, number> = {};

      yearExpenses.forEach((expense: Expense) => {
        const dueDate = parseISO(expense.due_date);
        if (isWithinInterval(dueDate, { start: monthStart, end: monthEnd })) {
          expense.amounts.forEach((amount: ExpenseAmount) => {
            totals[amount.currency] =
              (totals[amount.currency] || 0) + amount.amount;
          });
        }
      });

      months.push({
        month: format(monthDate, "yyyy-MM"),
        monthLabel: format(monthDate, "MMM"),
        totals,
      });
    }

    return months;
  }, [yearExpenses, now]);

  // Calculate year totals per currency
  const yearTotals = useMemo((): CurrencyTotal[] => {
    if (!yearExpenses) return [];

    const totals: Record<string, { total: number; count: number }> = {};

    yearExpenses.forEach((expense: Expense) => {
      expense.amounts.forEach((amount: ExpenseAmount) => {
        if (!totals[amount.currency]) {
          totals[amount.currency] = { total: 0, count: 0 };
        }
        totals[amount.currency].total += amount.amount;
        totals[amount.currency].count += 1;
      });
    });

    return Object.entries(totals)
      .map(([currency, data]) => ({
        currency,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [yearExpenses]);

  // Calculate paid vs pending totals
  const paidVsPending = useMemo(() => {
    if (!yearExpenses) return { paid: [], pending: [] };

    const paidTotals: Record<string, number> = {};
    const pendingTotals: Record<string, number> = {};

    yearExpenses.forEach((expense: Expense) => {
      expense.amounts.forEach((amount: ExpenseAmount) => {
        if (expense.is_paid) {
          paidTotals[amount.currency] =
            (paidTotals[amount.currency] || 0) + amount.amount;
        } else {
          pendingTotals[amount.currency] =
            (pendingTotals[amount.currency] || 0) + amount.amount;
        }
      });
    });

    return {
      paid: Object.entries(paidTotals).map(([currency, total]) => ({
        currency,
        total,
      })),
      pending: Object.entries(pendingTotals).map(([currency, total]) => ({
        currency,
        total,
      })),
    };
  }, [yearExpenses]);

  // Get exchange rates for display (both directions)
  const exchangeRatesDisplay = useMemo((): ExchangeRateDisplay[] => {
    if (!exchangeRates || !settings?.primary_currency) return [];

    const primaryCurrency = settings.primary_currency;
    const rates: ExchangeRateDisplay[] = [];

    currencies
      .filter((c) => c !== primaryCurrency)
      .forEach((currency) => {
        // Rate from other currency to primary (e.g., 1 CRC -> USD)
        const rateToPrimary = exchangeRates[`${currency}_${primaryCurrency}`];
        if (rateToPrimary) {
          rates.push({
            from: currency,
            to: primaryCurrency,
            rate: rateToPrimary,
          });
        }

        // Rate from primary to other currency (e.g., 1 USD -> CRC)
        const rateFromPrimary = exchangeRates[`${primaryCurrency}_${currency}`];
        if (rateFromPrimary) {
          rates.push({
            from: primaryCurrency,
            to: currency,
            rate: rateFromPrimary,
          });
        }
      });

    return rates;
  }, [exchangeRates, currencies, settings?.primary_currency]);

  const isLoading = expensesLoading || settingsLoading || ratesLoading;

  return {
    pendingPayments,
    monthComparison,
    monthlyTrends,
    yearTotals,
    paidVsPending,
    exchangeRatesDisplay,
    currencies,
    primaryCurrency: settings?.primary_currency || "USD",
    currentYear: now.getFullYear(),
    currentMonthName: format(now, "MMMM"),
    previousMonthName: format(subMonths(now, 1), "MMMM"),
    isLoading,
    totalExpensesCount: yearExpenses?.length || 0,
  };
}
