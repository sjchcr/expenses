import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

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

    // Fetch from serverless API
    try {
      const response = await fetch(
        `/api/exchange-rate?from=${fromCurrency}&to=${toCurrency}`
      );

      // Check if response is JSON (API might not be available on localhost)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          "Exchange rate API not available (likely running on localhost without Vercel dev)"
        );
        return null;
      }

      const data = await response.json();

      if (response.ok && data.rate) {
        const rate = data.rate;

        // Cache the rate
        const { error: insertError } = await supabase.from("exchange_rates").insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate,
          date: dateStr,
          source: "exchangerate-api",
        });

        if (insertError) {
          console.error("Failed to cache exchange rate:", insertError);
        }

        return rate;
      } else {
        console.error("Exchange rate API error:", data.error);
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
