import type {
  StockPeriod,
  StocksSettings,
  StockPeriodBreakdown,
  StockYearTotals,
} from "@/types";

/**
 * Default settings to use when no user settings exist yet.
 * All values default to 0.
 */
export const DEFAULT_STOCKS_SETTINGS: Omit<
  StocksSettings,
  "user_id" | "created_at" | "updated_at"
> = {
  us_tax_percentage: 0,
  local_tax_percentage: 0,
  broker_cost_usd: 0,
};

/**
 * Rounds a number to 2 decimal places for display.
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates the breakdown for a single stock period.
 *
 * Formulas:
 * - gross_usd = quantity * stock_price_usd
 * - us_tax_usd = gross_usd * us_tax_percentage
 * - broker_cost_usd = broker_cost_usd_setting (per period)
 * - local_tax_usd = (gross_usd - us_tax_usd - broker_cost_usd) * local_tax_percentage
 * - net_usd = gross_usd - us_tax_usd - local_tax_usd - broker_cost_usd (clamped to 0)
 *
 * @param period - The stock period to calculate
 * @param settings - The user's stocks settings (or defaults)
 * @returns Breakdown with gross, taxes, costs, and net amounts
 */
export function calcPeriodBreakdown(
  period: StockPeriod,
  settings: Pick<
    StocksSettings,
    "us_tax_percentage" | "local_tax_percentage" | "broker_cost_usd"
  > | null | undefined,
): StockPeriodBreakdown {
  const effectiveSettings = settings ?? DEFAULT_STOCKS_SETTINGS;

  const grossUsd = period.quantity * period.stock_price_usd;
  const usTaxUsd = grossUsd * effectiveSettings.us_tax_percentage;
  const brokerCostUsd = effectiveSettings.broker_cost_usd;

  // Local tax is applied to (gross - US tax - broker cost)
  const taxableForLocal = grossUsd - usTaxUsd - brokerCostUsd;
  const localTaxUsd = Math.max(0, taxableForLocal) * effectiveSettings.local_tax_percentage;

  const totalDeductions = usTaxUsd + localTaxUsd + brokerCostUsd;
  const rawNet = grossUsd - totalDeductions;

  // Clamp net to 0 if deductions exceed gross
  const netUsd = Math.max(0, rawNet);

  // Warning if taxes + costs exceed gross
  let warning: string | undefined;
  if (totalDeductions > grossUsd) {
    warning = "Taxes and costs exceed gross amount";
  }

  return {
    grossUsd: roundToTwoDecimals(grossUsd),
    usTaxUsd: roundToTwoDecimals(usTaxUsd),
    localTaxUsd: roundToTwoDecimals(localTaxUsd),
    brokerCostUsd: roundToTwoDecimals(brokerCostUsd),
    netUsd: roundToTwoDecimals(netUsd),
    warning,
  };
}

/**
 * Calculates totals for all periods in a year.
 *
 * @param periods - Array of stock periods for the year
 * @param settings - The user's stocks settings (or defaults)
 * @returns Totals for gross, taxes, costs, and net amounts
 */
export function calcYearTotals(
  periods: StockPeriod[],
  settings: Pick<
    StocksSettings,
    "us_tax_percentage" | "local_tax_percentage" | "broker_cost_usd"
  > | null | undefined,
): StockYearTotals {
  if (periods.length === 0) {
    return {
      grossUsd: 0,
      usTaxUsd: 0,
      localTaxUsd: 0,
      brokerCostUsd: 0,
      netUsd: 0,
      periodCount: 0,
    };
  }

  const breakdowns = periods.map((period) =>
    calcPeriodBreakdown(period, settings),
  );

  const totals = breakdowns.reduce(
    (acc, breakdown) => ({
      grossUsd: acc.grossUsd + breakdown.grossUsd,
      usTaxUsd: acc.usTaxUsd + breakdown.usTaxUsd,
      localTaxUsd: acc.localTaxUsd + breakdown.localTaxUsd,
      brokerCostUsd: acc.brokerCostUsd + breakdown.brokerCostUsd,
      netUsd: acc.netUsd + breakdown.netUsd,
    }),
    {
      grossUsd: 0,
      usTaxUsd: 0,
      localTaxUsd: 0,
      brokerCostUsd: 0,
      netUsd: 0,
    },
  );

  return {
    grossUsd: roundToTwoDecimals(totals.grossUsd),
    usTaxUsd: roundToTwoDecimals(totals.usTaxUsd),
    localTaxUsd: roundToTwoDecimals(totals.localTaxUsd),
    brokerCostUsd: roundToTwoDecimals(totals.brokerCostUsd),
    netUsd: roundToTwoDecimals(totals.netUsd),
    periodCount: periods.length,
  };
}

/**
 * Formats a USD amount for display.
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a percentage for display (e.g., 0.30 -> "30%").
 */
export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

/**
 * Converts a percentage display value to decimal (e.g., "30" -> 0.30).
 */
export function percentageToDecimal(percentage: number): number {
  return percentage / 100;
}

/**
 * Converts a decimal to percentage display value (e.g., 0.30 -> 30).
 */
export function decimalToPercentage(decimal: number): number {
  return decimal * 100;
}
