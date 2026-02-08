import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200 dark:border-accent shadow-md overflow-hidden p-0 gap-0">
        <CardHeader className="p-2 grid-rows-1">
          <Skeleton className="h-4 w-62.5" />
          <CardAction>
            <Skeleton className="h-9 w-9" />
          </CardAction>
        </CardHeader>
        <CardContent className="p-2 flex flex-col gap-2">
          <div className="flex justify-start items-center gap-1">
            <Skeleton className="h-9 w-18" />
            <Skeleton className="h-9 w-18" />
            <Skeleton className="h-9 w-18" />
          </div>
          <Skeleton className="h-15.25 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-30.25 w-full" />
            <Skeleton className="h-30.25 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 dark:border-accent shadow-md overflow-hidden p-0 gap-0">
        <CardHeader className="p-2 grid-rows-1">
          <Skeleton className="h-4 w-62.5" />
          <CardAction>
            <Skeleton className="h-9 w-9" />
          </CardAction>
        </CardHeader>
        <CardContent className="p-2 flex flex-col gap-2">
          <div className="flex justify-start items-center gap-1">
            <Skeleton className="h-9 w-18" />
            <Skeleton className="h-9 w-18" />
            <Skeleton className="h-9 w-18" />
          </div>
          <Skeleton className="h-15.25 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-30.25 w-full" />
            <Skeleton className="h-30.25 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
