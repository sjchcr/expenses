import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensesLoadingSkeleton() {
  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-0">
        <CardHeader className="px-4 flex justify-between items-center gap-2 w-full">
          <Skeleton className="h-6 w-52" />
          <CardAction>
            <Skeleton className="h-11 w-11 sm:h-9 sm:w-9 rounded-full" />
          </CardAction>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-2">
            <Skeleton className="h-11 sm:h-9 w-full rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-4 border-b border-gray-200 last:border-b-0"
              >
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-32" />
                <Skeleton className="mt-4 h-2 w-full rounded-full" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-2 h-4 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-2 h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card
            key={cardIndex}
            className="border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-0"
          >
            <CardHeader className="grid-rows-1">
              <Skeleton className="h-6 w-44" />
              <CardAction>
                <Skeleton className="h-11 w-11 sm:h-9 sm:w-9 rounded-full" />
              </CardAction>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-start items-center gap-1">
                  <Skeleton className="h-11 w-18 rounded-full" />
                  <Skeleton className="h-11 w-18 rounded-full" />
                  <Skeleton className="h-11 w-18 rounded-full" />
                </div>
              </div>
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  <Skeleton className="h-5 w-48" />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
