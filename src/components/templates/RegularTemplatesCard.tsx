import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, CircleOff, Zap } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMobile } from "@/hooks/useMobile";
import { formatAmountsDisplay } from "./utils";
import type { ExpenseCategory, ExpenseTemplate } from "@/types";
import { CategoryIcon } from "@/components/categories";

interface RegularTemplatesCardProps {
  templates: ExpenseTemplate[];
  onEdit: (template: ExpenseTemplate) => void;
  onDelete: (template: ExpenseTemplate) => void;
  onCreate: () => void;
  categories: ExpenseCategory[];
}

export function RegularTemplatesCard({
  templates,
  onEdit,
  onDelete,
  onCreate,
  categories,
}: RegularTemplatesCardProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  if (templates.length === 0) {
    return (
      <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden py-2 items-center justify-center">
        <CardContent className="px-2">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>{t("templates.noQuickTemplates")}</EmptyTitle>
              <EmptyDescription>
                {t("templates.noQuickTemplatesDesc")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4" />
                {t("templates.createQuickTemplate")}
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {t("templates.quickTemplates")}
        </CardTitle>
        <CardDescription>{t("templates.quickTemplatesDesc")}</CardDescription>
        {!isMobile && (
          <CardAction>
            <Button size="icon" onClick={onCreate}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="hover:bg-primary/5">
                <TableCell className="font-medium pl-4">
                  <span className="flex items-center gap-1.5">
                    {(() => {
                      const category = template.category_id
                        ? categoriesById.get(template.category_id)
                        : null;

                      return category ? (
                        <CategoryIcon
                          icon={category.icon}
                          color={category.color}
                          className="size-5"
                          iconClassName="size-3"
                        />
                      ) : null;
                    })()}
                    <span className="truncate">{template.name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {formatAmountsDisplay(template.amounts).map(
                      (text, index) => (
                        <p key={index} className="col-span-1 text-sm">
                          {text}
                        </p>
                      ),
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-4 w-24">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(template)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghostDestructive"
                      size="icon"
                      onClick={() => onDelete(template)}
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
                  {t("templates.totalTemplates")}: {templates.length}
                </p>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
