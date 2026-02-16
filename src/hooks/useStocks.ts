import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stocksService } from "@/services/stocks.service";
import type {
  StocksSettingsInsert,
  StockPeriodInsert,
  StockPeriodUpdate,
} from "@/types";

// Query keys
export const stocksKeys = {
  all: ["stocks"] as const,
  settings: () => [...stocksKeys.all, "settings"] as const,
  periods: () => [...stocksKeys.all, "periods"] as const,
  periodsByYear: (year: number) => [...stocksKeys.periods(), year] as const,
};

// ============================================================================
// Stocks Settings Hooks
// ============================================================================

/**
 * Hook to fetch the current user's stocks settings.
 */
export function useStocksSettings() {
  return useQuery({
    queryKey: stocksKeys.settings(),
    queryFn: () => stocksService.getStocksSettings(),
  });
}

/**
 * Hook to upsert stocks settings.
 */
export function useUpsertStocksSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Omit<StocksSettingsInsert, "user_id">) =>
      stocksService.upsertStocksSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.settings() });
    },
  });
}

// ============================================================================
// Stock Periods Hooks
// ============================================================================

/**
 * Hook to fetch stock periods for a specific year.
 */
export function useStockPeriods(year: number) {
  return useQuery({
    queryKey: stocksKeys.periodsByYear(year),
    queryFn: () => stocksService.listStockPeriodsByYear(year),
  });
}

/**
 * Hook to create a new stock period.
 */
export function useCreateStockPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (period: Omit<StockPeriodInsert, "user_id">) =>
      stocksService.createStockPeriod(period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.periods() });
    },
  });
}

/**
 * Hook to update an existing stock period.
 */
export function useUpdateStockPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: StockPeriodUpdate }) =>
      stocksService.updateStockPeriod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.periods() });
    },
  });
}

/**
 * Hook to delete a stock period.
 */
export function useDeleteStockPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stocksService.deleteStockPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stocksKeys.periods() });
    },
  });
}
