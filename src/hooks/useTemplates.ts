import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesService } from "@/services/templates.service";
import type { ExpenseTemplateInsert, ExpenseTemplateUpdate } from "@/types";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => templatesService.getTemplates(),
  });
}

export function useRecurringTemplates() {
  return useQuery({
    queryKey: ["templates", "recurring"],
    queryFn: () => templatesService.getRecurringTemplates(),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Omit<ExpenseTemplateInsert, "user_id">) =>
      templatesService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: ExpenseTemplateUpdate;
    }) => templatesService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
