import type { SalaryDeduction, RentTaxBracket, SalaryRecord, SalarySettings, SalaryBreakdown } from "@/types";

export const DEFAULT_SALARY_DEDUCTIONS: SalaryDeduction[] = [
  { id: "ccss",      name: "CCSS",               type: "percentage", amount: 0.1083, active: true },
  { id: "aso",       name: "AsoAmazon",           type: "percentage", amount: 0.05,   active: true },
  { id: "provision", name: "Provisión AsoAmazon", type: "nominal",    amount: 500,    active: true },
  { id: "creditos",  name: "Créditos AsoAmazon",  type: "nominal",    amount: 0,      active: true },
];

export const DEFAULT_RENT_TAX_BRACKETS: RentTaxBracket[] = [
  { id: "exempt", min: 0,       max: 918000,  rate: 0    },
  { id: "b10",    min: 918000,  max: 1347000, rate: 0.10 },
  { id: "b15",    min: 1347000, max: 2364000, rate: 0.15 },
  { id: "b20",    min: 2364000, max: 4727000, rate: 0.20 },
  { id: "b25",    min: 4727000, max: null,    rate: 0.25 },
];

function roundTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCRC(amount: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "USD") return formatUsd(amount);
  return formatCRC(amount);
}

export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(2)}%`;
}

export function percentageToDecimal(pct: number): number {
  return pct / 100;
}

export function decimalToPercentage(decimal: number): number {
  return decimal * 100;
}

function bracketLabel(bracket: RentTaxBracket): string {
  if (bracket.rate === 0) return `Up to ${formatCRC(bracket.max ?? 0)}`;
  if (bracket.max === null) return `Over ${formatCRC(bracket.min)}`;
  return `${formatCRC(bracket.min)} – ${formatCRC(bracket.max)}`;
}

function calcRentTax(
  grossCrc: number,
  brackets: RentTaxBracket[],
): SalaryBreakdown["rentTax"] {
  const sorted = [...brackets].sort((a, b) => a.min - b.min);
  let remaining = grossCrc;
  let monthlyTotal = 0;

  const bracketResults = sorted
    .filter((b) => grossCrc > b.min) // only brackets the salary reaches
    .map((b) => {
      const cap = b.max ?? Infinity;
      const taxableAmount = roundTwo(Math.min(remaining, cap - b.min));
      const monthlyAmount = roundTwo(taxableAmount * b.rate);
      remaining -= taxableAmount;
      monthlyTotal += monthlyAmount;
      return {
        label: bracketLabel(b),
        rate: b.rate,
        taxableAmount,
        monthlyAmount,
        fortnightlyAmount: roundTwo(monthlyAmount / 2),
      };
    });

  return {
    brackets: bracketResults,
    monthlyTotal: roundTwo(monthlyTotal),
    fortnightlyTotal: roundTwo(monthlyTotal / 2),
    appliedToCrc: true,
  };
}

export function calcSalaryBreakdown(
  record: SalaryRecord,
  settings: SalarySettings | null,
  exchangeRate?: number | null,
): SalaryBreakdown {
  const brackets = settings?.rent_tax_brackets?.length
    ? settings.rent_tax_brackets
    : DEFAULT_RENT_TAX_BRACKETS;

  const grossMonthly = record.gross_amount;
  const grossFortnightly = roundTwo(grossMonthly / 2);
  const isCrc = record.currency === "CRC";

  // Active deductions
  const activeDeductions = record.deductions.filter((d) => d.active);
  const deductions = activeDeductions.map((d) => {
    const monthlyAmount = roundTwo(
      d.type === "percentage" ? grossMonthly * d.amount : d.amount,
    );
    return {
      id: d.id,
      name: d.name,
      type: d.type,
      rate: d.amount,
      monthlyAmount,
      fortnightlyAmount: roundTwo(monthlyAmount / 2),
    };
  });

  // Rent tax (only if CRC salary)
  const rentTax = isCrc
    ? calcRentTax(grossMonthly, brackets)
    : { brackets: [], monthlyTotal: 0, fortnightlyTotal: 0, appliedToCrc: false };

  const totalDeductionsMonthly = roundTwo(
    deductions.reduce((s, d) => s + d.monthlyAmount, 0) + rentTax.monthlyTotal,
  );
  const totalDeductionsFortnightly = roundTwo(totalDeductionsMonthly / 2);

  const netMonthly = roundTwo(Math.max(0, grossMonthly - totalDeductionsMonthly));
  const netFortnightly = roundTwo(netMonthly / 2);

  // Currency conversion
  let convertedCurrency: string | null = null;
  let netMonthlyConverted: number | null = null;
  let netFortnightlyConverted: number | null = null;
  const rate = exchangeRate ?? null;

  if (rate) {
    if (isCrc) {
      convertedCurrency = "USD";
      netMonthlyConverted = roundTwo(netMonthly / rate);
      netFortnightlyConverted = roundTwo(netFortnightly / rate);
    } else {
      convertedCurrency = "CRC";
      netMonthlyConverted = roundTwo(netMonthly * rate);
      netFortnightlyConverted = roundTwo(netFortnightly * rate);
    }
  }

  return {
    grossMonthly,
    grossFortnightly,
    currency: record.currency,
    deductions,
    rentTax,
    totalDeductionsMonthly,
    totalDeductionsFortnightly,
    netMonthly,
    netFortnightly,
    convertedCurrency,
    exchangeRate: rate,
    netMonthlyConverted,
    netFortnightlyConverted,
  };
}
