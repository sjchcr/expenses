import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CircleOff,
  FolderPlus,
  Pencil,
  Trash2,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { useMobile } from "@/hooks/useMobile";
import { CategoryIcon } from "@/components/categories";
import type { ExpenseBucket, ExpenseCategory } from "@/types";
import { formatBudgetAmount, getCurrencySymbol } from "./bucketUtils";

interface BucketsCardProps {
  buckets: ExpenseBucket[];
  categories: ExpenseCategory[];
  onEdit: (bucket: ExpenseBucket) => void;
  onDelete: (bucket: ExpenseBucket) => void;
  onCreate: () => void;
}

export function BucketsCard({
  buckets,
  categories,
  onEdit,
  onDelete,
  onCreate,
}: BucketsCardProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  if (buckets.length === 0) {
    return (
      <Card className="gap-2 overflow-hidden border border-gray-200 bg-linear-to-b from-background to-accent shadow-md dark:border-gray-900 col-span-1 lg:col-span-3">
        <CardContent className="px-2">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>{t("buckets.empty")}</EmptyTitle>
              <EmptyDescription>
                {t("buckets.emptyDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={onCreate}>
                <FolderPlus className="h-4 w-4" />
                {t("buckets.create")}
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-2 overflow-hidden border border-gray-200 bg-linear-to-b from-background to-accent shadow-md dark:border-gray-900 col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="h-4 w-4" />
          {t("buckets.title")}
        </CardTitle>
        <CardDescription>{t("buckets.description")}</CardDescription>
        {!isMobile && (
          <CardAction>
            <Button size="icon" onClick={onCreate}>
              <FolderPlus className="h-4 w-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {buckets.map((bucket) => {
              const bucketCategories = bucket.category_ids
                .map((categoryId) => categoriesById.get(categoryId))
                .filter((category): category is ExpenseCategory =>
                  Boolean(category),
                );

              return (
                <TableRow key={bucket.id} className="hover:bg-primary/5">
                  <TableCell className="pl-4">
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {bucket.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {bucketCategories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {t("buckets.noCategories")}
                          </span>
                        ) : (
                          bucketCategories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs"
                            >
                              <CategoryIcon
                                icon={category.icon}
                                color={category.color}
                                className="size-4"
                                iconClassName="size-2.5"
                              />
                              {category.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pl-4 shrink-0 text-right">
                    <span className="shrink-0 tabular-nums">
                      {getCurrencySymbol(bucket.currency)}
                      {formatBudgetAmount(bucket.monthly_budget)}
                    </span>
                  </TableCell>
                  <TableCell className="w-24 pr-4">
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(bucket)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghostDestructive"
                        size="icon"
                        onClick={() => onDelete(bucket)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="px-4 pb-0 pt-2">
                <p className="text-xs text-gray-500">
                  {t("buckets.totalBuckets")}: {buckets.length}
                </p>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
