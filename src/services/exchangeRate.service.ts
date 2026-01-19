import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

export const exchangeRateService = {
  async getRate(fromCurrency: string, toCurrency: string, date?: Date) {
    if (fromCurrency === toCurrency) return 1;

    const dateStr = date
      ? format(date, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    // Check cache first
    const { data: cached } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("from_currency", fromCurrency)
      .eq("to_currency", toCurrency)
      .eq("date", dateStr)
      .maybeSingle();

    if (cached) {
      return cached.rate;
    }

    // Fetch from API
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
      );
      const data = await response.json();

      if (data.result === "success") {
        const rate = data.conversion_rate;

        // Cache the rate
        await supabase.from("exchange_rates").insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate,
          date: dateStr,
          source: "exchangerate-api",
        });

        return rate;
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    }

    return null;
  },

  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getRate(fromCurrency, toCurrency);
    if (!rate) return null;

    return amount * rate;
  },
};
