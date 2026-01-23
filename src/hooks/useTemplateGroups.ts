import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateGroupsService } from "@/services/templateGroups.service";
import type { TemplateGroupInsert, TemplateGroupUpdate } from "@/types";

export function useTemplateGroups() {
  return useQuery({
    queryKey: ["template-groups"],
    queryFn: () => templateGroupsService.getGroups(),
  });
}

export function useCreateTemplateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (group: Omit<TemplateGroupInsert, "user_id">) =>
      templateGroupsService.createGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-groups"] });
    },
  });
}

export function useUpdateTemplateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: TemplateGroupUpdate;
    }) => templateGroupsService.updateGroup(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-groups"] });
    },
  });
}

export function useDeleteTemplateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateGroupsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-groups"] });
    },
  });
}
