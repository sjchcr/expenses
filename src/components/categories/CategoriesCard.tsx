import { useTranslation } from "react-i18next";
import { CircleOff, FolderPlus, Pencil, Shapes, Trash2 } from "lucide-react";
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
import { useMobile } from "@/hooks/useMobile";
import type { ExpenseCategory } from "@/types";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";

interface CategoriesCardProps {
  categories: ExpenseCategory[];
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (category: ExpenseCategory) => void;
  onCreate: () => void;
}

export function CategoriesCard({
  categories,
  onEdit,
  onDelete,
  onCreate,
}: CategoriesCardProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  if (categories.length === 0) {
    return (
      <Card className="gap-2 overflow-hidden border border-gray-200 bg-linear-to-b from-background to-accent shadow-md dark:border-gray-900">
        <CardContent className="px-2">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>{t("categories.empty")}</EmptyTitle>
              <EmptyDescription>
                {t("categories.emptyDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={onCreate}>
                <FolderPlus className="h-4 w-4" />
                {t("categories.create")}
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-2 overflow-hidden border border-gray-200 bg-linear-to-b from-background to-accent shadow-md dark:border-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shapes className="h-4 w-4" />
          {t("categories.title")}
        </CardTitle>
        <CardDescription>{t("categories.description")}</CardDescription>
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
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-primary/5">
                <TableCell className="font-medium pl-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <CategoryIcon icon={category.icon} color={category.color} />
                    <span className="truncate text-sm font-medium">
                      {category.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="pr-4 w-24">
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghostDestructive"
                      size="icon"
                      onClick={() => onDelete(category)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="px-4 pt-2 pb-0">
                <p className="text-xs text-gray-500">
                  {t("categories.totalCategories")}: {categories.length}
                </p>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
