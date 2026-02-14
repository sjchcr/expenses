import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  CircleOff,
  CalendarDays,
  Ellipsis,
  Edit,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ExpenseTemplate } from "@/types";

interface RecurringTemplatesCardProps {
  templates: ExpenseTemplate[];
  onEdit: (template: ExpenseTemplate) => void;
  onDelete: (template: ExpenseTemplate) => void;
  onCreate: () => void;
}

export function RecurringTemplatesCard({
  templates,
  onEdit,
  onDelete,
  onCreate,
}: RecurringTemplatesCardProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  if (templates.length === 0) {
    return (
      <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden py-2 items-center justify-center">
        <CardContent className="px-2">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>{t("templates.noRecurringTemplates")}</EmptyTitle>
              <EmptyDescription>
                {t("templates.noRecurringTemplatesDesc")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                {t("templates.createRecurringTemplate")}
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
          <CalendarDays className="h-4 w-4" />
          {t("templates.recurringBills")}
        </CardTitle>
        <CardDescription>{t("templates.recurringBillsDesc")}</CardDescription>
        {!isMobile && (
          <CardAction>
            <Button size="icon" onClick={onCreate}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-0 p-0">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between gap-2 px-4 py-2 border-b hover:bg-primary/5"
          >
            <div className="flex flex-col items-start justify-start gap-2 w-full">
              <p className="font-bold text-sm">{template.name}</p>
              <div className="flex justify-between gap-2 w-full">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {formatAmountsDisplay(template.amounts).map((text, index) => (
                    <p key={index} className="col-span-1 text-sm">
                      {text}
                    </p>
                  ))}
                </div>
                <p className="text-sm w-20">
                  {template.recurrence_day
                    ? `${t("common.day")} ${template.recurrence_day}`
                    : "-"}
                </p>
              </div>
            </div>
            <div className="gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit />
                      {t("templates.editTemplate")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(template)}
                    >
                      <Trash2 />
                      {t("templates.deleteTemplate")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 px-4 pt-4">
          {t("templates.totalTemplates")}: {templates.length}
        </p>
      </CardContent>
    </Card>
  );
}
