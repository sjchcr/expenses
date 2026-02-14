import type { TemplateAmount } from "@/types";

export const formatAmountsDisplay = (amounts: TemplateAmount[]) => {
  return amounts.map((a) =>
    a.amount ? `${a.currency} ${a.amount.toLocaleString()}` : a.currency
  );
};
