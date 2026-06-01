import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useExpenses } from "./useExpenses";
import { getExchangeRate, useExchangeRates } from "./useExchangeRates";
import { useUserSettings } from "./useUserSettings";
import { useCategories } from "./useCategories";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  eachDayOfInterval,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type { Expense, ExpenseAmount } from "@/types";

export type DashboardStatsPeriod = "yearly" | "monthly";

const MONTH_TRANSLATION_KEYS = [
  "months.january",
  "months.february",
  "months.march",
  "months.april",
  "months.may",
  "months.june",
  "months.july",
  "months.august",
  "months.september",
  "months.october",
  "months.november",
  "months.december",
] as const;

export interface CurrencyTotal {
  currency: string;
  total: number;
  count: number;
}

export interface CategoryTotal {
  id: string;
  name: string;
  color: string;
  icon: string;
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

export function useDashboardStats(period: DashboardStatsPeriod = "yearly") {
  const { t } = useTranslation();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthDate = subMonths(now, 1);
  const previousMonthStart = startOfMonth(previousMonthDate);
  const previousMonthEnd = endOfMonth(previousMonthDate);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  const previousYearDate = subYears(now, 1);
  const previousYearStart = startOfYear(previousYearDate);
  const previousYearEnd = endOfYear(previousYearDate);
  const periodStart = period === "monthly" ? currentMonthStart : yearStart;
  const periodEnd = period === "monthly" ? currentMonthEnd : yearEnd;
  const comparisonStart =
    period === "monthly" ? previousMonthStart : previousYearStart;
  const comparisonEnd =
    period === "monthly" ? previousMonthEnd : previousYearEnd;

  const queryStartDate =
    comparisonStart < periodStart ? comparisonStart : periodStart;

  const {
    data: allExpenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useExpenses({
    startDate: format(queryStartDate, "yyyy-MM-dd"),
    endDate: format(periodEnd, "yyyy-MM-dd"),
  });

  const periodExpenses = useMemo(() => {
    if (!allExpenses) return [];
    return allExpenses.filter((expense) => {
      const dueDate = parseISO(expense.due_date);
      return isWithinInterval(dueDate, { start: periodStart, end: periodEnd });
    });
  }, [allExpenses, periodEnd, periodStart]);

  const { settings, isLoading: settingsLoading } = useUserSettings();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Get all unique currencies from expenses
  const currencies = useMemo(() => {
    if (!periodExpenses) return [];
    const currencySet = new Set<string>();
    periodExpenses.forEach((expense) => {
      expense.amounts.forEach((amount: ExpenseAmount) => {
        currencySet.add(amount.currency);
      });
    });
    return Array.from(currencySet);
  }, [periodExpenses]);

  const currenciesForRates = useMemo(() => {
    const primaryCurrency = settings?.primary_currency;
    if (!primaryCurrency) return currencies;
    return Array.from(new Set([...currencies, primaryCurrency]));
  }, [currencies, settings?.primary_currency]);

  const { data: exchangeRates, isLoading: ratesLoading } =
    useExchangeRates(currenciesForRates);

  // Calculate pending payments for current month (per currency)
  const pendingPayments = useMemo((): CurrencyTotal[] => {
    if (!periodExpenses) return [];

    const currencyTotals: Record<string, { total: number; count: number }> = {};

    periodExpenses
      .filter((expense: Expense) => {
        return !expense.is_paid;
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
  }, [periodExpenses]);

  // Calculate selected period comparison.
  const monthComparison = useMemo((): MonthComparison[] => {
    if (!allExpenses) return [];

    const currentTotals: Record<string, number> = {};
    const previousTotals: Record<string, number> = {};

    allExpenses.forEach((expense: Expense) => {
      const dueDate = parseISO(expense.due_date);

      const isCurrentPeriod = isWithinInterval(dueDate, {
        start: periodStart,
        end: periodEnd,
      });

      const isPreviousPeriod = isWithinInterval(dueDate, {
        start: comparisonStart,
        end: comparisonEnd,
      });

      if (isCurrentPeriod || isPreviousPeriod) {
        expense.amounts.forEach((amount: ExpenseAmount) => {
          if (isCurrentPeriod) {
            currentTotals[amount.currency] =
              (currentTotals[amount.currency] || 0) + amount.amount;
          }
          if (isPreviousPeriod) {
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
    comparisonEnd,
    comparisonStart,
    periodEnd,
    periodStart,
  ]);

  // Calculate monthly spending trends for the year
  const monthlyTrends = useMemo((): MonthlyData[] => {
    if (!periodExpenses) return [];

    const months: MonthlyData[] = [];

    if (period === "monthly") {
      const days = eachDayOfInterval({
        start: currentMonthStart,
        end: currentMonthEnd,
      });

      days.forEach((day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const totals: Record<string, number> = {};

        periodExpenses.forEach((expense: Expense) => {
          const dueDate = parseISO(expense.due_date);
          if (isWithinInterval(dueDate, { start: dayStart, end: dayEnd })) {
            expense.amounts.forEach((amount: ExpenseAmount) => {
              totals[amount.currency] =
                (totals[amount.currency] || 0) + amount.amount;
            });
          }
        });

        months.push({
          month: format(day, "yyyy-MM-dd"),
          monthLabel: format(day, "d"),
          totals,
        });
      });

      return months;
    }

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const totals: Record<string, number> = {};

      periodExpenses.forEach((expense: Expense) => {
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
  }, [currentMonthEnd, currentMonthStart, now, period, periodExpenses]);

  // Calculate year totals per currency
  const yearTotals = useMemo((): CurrencyTotal[] => {
    if (!periodExpenses) return [];

    const totals: Record<string, { total: number; count: number }> = {};

    periodExpenses.forEach((expense: Expense) => {
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
  }, [periodExpenses]);

  const categoryTotals = useMemo((): CategoryTotal[] => {
    if (!periodExpenses) return [];

    const primaryCurrency = settings?.primary_currency || "USD";
    const categoriesById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const totals: Record<string, CategoryTotal> = {};

    periodExpenses.forEach((expense: Expense) => {
      const category = expense.category_id
        ? categoriesById.get(expense.category_id)
        : null;
      const id = category?.id ?? "uncategorized";

      if (!totals[id]) {
        totals[id] = {
          id,
          name: category?.name ?? t("dashboard.uncategorized"),
          color: category?.color || "var(--muted-foreground)",
          icon: category?.icon || "tag",
          total: 0,
          count: 0,
        };
      }

      expense.amounts.forEach((amount: ExpenseAmount) => {
        if (amount.currency === primaryCurrency) {
          totals[id].total += amount.amount;
          return;
        }

        if (amount.exchange_rate) {
          totals[id].total += amount.amount * amount.exchange_rate;
          return;
        }

        const exchangeRate = getExchangeRate(
          exchangeRates,
          amount.currency,
          primaryCurrency,
        );

        if (exchangeRate) {
          totals[id].total += amount.amount * exchangeRate;
        }
      });
      totals[id].count += 1;
    });

    return Object.values(totals).sort((a, b) => b.total - a.total);
  }, [
    categories,
    exchangeRates,
    periodExpenses,
    settings?.primary_currency,
    t,
  ]);

  // Calculate paid vs pending totals
  const paidVsPending = useMemo(() => {
    if (!periodExpenses) return { paid: [], pending: [] };

    const paidTotals: Record<string, number> = {};
    const pendingTotals: Record<string, number> = {};

    periodExpenses.forEach((expense: Expense) => {
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
  }, [periodExpenses]);

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

  const isLoading =
    expensesLoading || settingsLoading || ratesLoading || categoriesLoading;

  const refetch = async () => {
    await refetchExpenses();
  };

  return {
    pendingPayments,
    monthComparison,
    monthlyTrends,
    yearTotals,
    categoryTotals,
    paidVsPending,
    exchangeRatesDisplay,
    currencies,
    primaryCurrency: settings?.primary_currency || "USD",
    currentYear: now.getFullYear(),
    period,
    periodLabel:
      period === "monthly"
        ? t(MONTH_TRANSLATION_KEYS[now.getMonth()])
        : String(now.getFullYear()),
    currentComparisonLabel:
      period === "monthly"
        ? t(MONTH_TRANSLATION_KEYS[now.getMonth()])
        : String(now.getFullYear()),
    previousComparisonLabel:
      period === "monthly"
        ? t(MONTH_TRANSLATION_KEYS[previousMonthDate.getMonth()])
        : String(previousYearDate.getFullYear()),
    currentMonthName: t(MONTH_TRANSLATION_KEYS[now.getMonth()]),
    previousMonthName: t(
      MONTH_TRANSLATION_KEYS[previousMonthDate.getMonth()],
    ),
    isLoading,
    totalExpensesCount: periodExpenses?.length || 0,
    refetch,
  };
}
