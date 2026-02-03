import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salariesService } from "@/services/salaries.service";
import type { SalaryInsert, SalaryUpdate } from "@/types";

export function useSalaries(aguinaldoYear: number) {
  return useQuery({
    queryKey: ["salaries", aguinaldoYear],
    queryFn: () => salariesService.getSalariesForAguinaldoYear(aguinaldoYear),
  });
}

export function useUpsertSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salary: Omit<SalaryInsert, "user_id">) =>
      salariesService.upsertSalary(salary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SalaryUpdate }) =>
      salariesService.updateSalary(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salariesService.deleteSalary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
    },
  });
}
