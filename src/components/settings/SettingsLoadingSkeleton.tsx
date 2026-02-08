import { Skeleton } from "@/components/ui/skeleton";

export function SettingsLoadingSkeleton() {
  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
