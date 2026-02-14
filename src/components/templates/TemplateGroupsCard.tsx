import { useTranslation } from "react-i18next";
import { Pencil, Trash2, CircleOff, FolderPlus, Layers } from "lucide-react";
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
import type { ExpenseTemplate, TemplateGroup } from "@/types";

interface TemplateGroupsCardProps {
  groups: TemplateGroup[];
  templates: ExpenseTemplate[] | undefined;
  onEdit: (group: TemplateGroup) => void;
  onDelete: (group: TemplateGroup) => void;
  onCreate: () => void;
}

export function TemplateGroupsCard({
  groups,
  templates,
  onEdit,
  onDelete,
  onCreate,
}: TemplateGroupsCardProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const getGroupTemplateNames = (templateIds: string[]): string => {
    if (!templates) return "";
    return templateIds
      .map((id) => templates.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  if (groups.length === 0) {
    return (
      <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-2">
        <CardContent className="px-2">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>{t("groups.noGroups")}</EmptyTitle>
              <EmptyDescription>
                {templates && templates.length > 0
                  ? t("groups.noGroupsDesc")
                  : t("groups.noTemplatesForGroups")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              {templates && templates.length > 0 && (
                <Button onClick={onCreate}>
                  <FolderPlus className="h-4 w-4" />
                  {t("groups.newGroup")}
                </Button>
              )}
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
          <Layers className="h-4 w-4" />
          {t("groups.title")}
        </CardTitle>
        <CardDescription>{t("groups.description")}</CardDescription>
        {!isMobile && (
          <CardAction>
            <Button
              size="icon"
              onClick={onCreate}
              disabled={!templates || templates.length === 0}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="border border-gray-200 dark:border-gray-900 rounded-lg p-2 bg-background"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{group.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {getGroupTemplateNames(group.template_ids) || "No templates"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {group.template_ids.length}{" "}
                    {t("groups.groupTemplates").toLowerCase()}
                    {group.template_ids.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(group)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghostDestructive"
                    size="icon"
                    onClick={() => onDelete(group)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
