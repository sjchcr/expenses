import { useQuery } from "@tanstack/react-query";
import { exchangeRateService } from "@/services/exchangeRate.service";

interface CurrencyPair {
  from: string;
  to: string;
}

export function useExchangeRates(currencies: string[]) {
  // Generate all currency pairs needed for conversion
  const pairs: CurrencyPair[] = [];
  for (const from of currencies) {
    for (const to of currencies) {
      if (from !== to) {
        pairs.push({ from, to });
      }
    }
  }

  return useQuery({
    queryKey: ["exchangeRates", currencies.sort().join(",")],
    queryFn: async () => {
      const rates: Record<string, number> = {};

      // Fetch all rates in parallel
      await Promise.all(
        pairs.map(async ({ from, to }) => {
          const rate = await exchangeRateService.getRate(from, to);
          if (rate !== null) {
            rates[`${from}_${to}`] = rate;
          }
        }),
      );

      return rates;
    },
    enabled: currencies.length > 1,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function getExchangeRate(
  rates: Record<string, number> | undefined,
  from: string,
  to: string,
): number | null {
  if (from === to) return 1;
  if (!rates) return null;
  return rates[`${from}_${to}`] ?? null;
}
