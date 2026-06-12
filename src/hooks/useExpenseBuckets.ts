import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseBucketsService } from "@/services/expenseBuckets.service";
import type { ExpenseBucketInsert, ExpenseBucketUpdate } from "@/types";

export function useExpenseBuckets() {
  return useQuery({
    queryKey: ["expense-buckets"],
    queryFn: () => expenseBucketsService.getBuckets(),
  });
}

export function useCreateExpenseBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucket: Omit<ExpenseBucketInsert, "user_id">) =>
      expenseBucketsService.createBucket(bucket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-buckets"] });
    },
  });
}

export function useUpdateExpenseBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: ExpenseBucketUpdate;
    }) => expenseBucketsService.updateBucket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-buckets"] });
    },
  });
}

export function useDeleteExpenseBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseBucketsService.deleteBucket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-buckets"] });
    },
  });
}
