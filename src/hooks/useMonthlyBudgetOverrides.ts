import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { monthlyBudgetOverridesService } from "@/services/monthlyBudgetOverrides.service";

export function useMonthlyBudgetOverride(month: string) {
  return useQuery({
    queryKey: ["monthly-budget-override", month],
    queryFn: () => monthlyBudgetOverridesService.getOverride(month),
  });
}

export function useSaveMonthlyBudgetOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      month,
      excludedCategoryIds,
      bucketBudgetOverrides,
    }: {
      month: string;
      excludedCategoryIds: string[];
      bucketBudgetOverrides: Record<string, number>;
    }) =>
      monthlyBudgetOverridesService.saveOverride({
        month,
        excludedCategoryIds,
        bucketBudgetOverrides,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["monthly-budget-override", variables.month],
      });
    },
  });
}
