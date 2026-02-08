import type { TFunction } from "i18next";

export const CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP"];

export interface AguinaldoMonth {
  year: number;
  month: number;
  label: string;
}

// For aguinaldo year X, we need Dec of X-1 and Jan-Nov of X
// Display order: Dec (prev year), Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov
export const getAguinaldoMonths = (
  aguinaldoYear: number,
  t: TFunction,
): AguinaldoMonth[] => [
  {
    year: aguinaldoYear - 1,
    month: 12,
    label: `${t("months.december")} ${aguinaldoYear - 1}`,
  },
  { year: aguinaldoYear, month: 1, label: t("months.january") },
  { year: aguinaldoYear, month: 2, label: t("months.february") },
  { year: aguinaldoYear, month: 3, label: t("months.march") },
  { year: aguinaldoYear, month: 4, label: t("months.april") },
  { year: aguinaldoYear, month: 5, label: t("months.may") },
  { year: aguinaldoYear, month: 6, label: t("months.june") },
  { year: aguinaldoYear, month: 7, label: t("months.july") },
  { year: aguinaldoYear, month: 8, label: t("months.august") },
  { year: aguinaldoYear, month: 9, label: t("months.september") },
  { year: aguinaldoYear, month: 10, label: t("months.october") },
  { year: aguinaldoYear, month: 11, label: t("months.november") },
];

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
