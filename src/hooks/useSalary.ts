import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salaryService } from "@/services/salary.service";
import type { SalarySettingsInsert, SalaryRecordInsert, SalaryRecordUpdate } from "@/types";

export const salaryKeys = {
  all: ["salary"] as const,
  settings: () => [...salaryKeys.all, "settings"] as const,
  records: () => [...salaryKeys.all, "records"] as const,
};

export function useSalarySettings() {
  return useQuery({
    queryKey: salaryKeys.settings(),
    queryFn: () => salaryService.getSalarySettings(),
  });
}

export function useUpsertSalarySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Omit<SalarySettingsInsert, "user_id">) =>
      salaryService.upsertSalarySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.settings() });
    },
  });
}

export function useSalaryRecords() {
  return useQuery({
    queryKey: salaryKeys.records(),
    queryFn: () => salaryService.listSalaryRecords(),
  });
}

export function useCreateSalaryRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: Omit<SalaryRecordInsert, "user_id">) =>
      salaryService.createSalaryRecord(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.records() });
    },
  });
}

export function useUpdateSalaryRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SalaryRecordUpdate }) =>
      salaryService.updateSalaryRecord(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.records() });
    },
  });
}

export function useDeleteSalaryRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryService.deleteSalaryRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.records() });
    },
  });
}
