import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Pencil,
  Trash2,
  CircleOff,
  CalendarDays,
  FolderPlus,
  Layers,
  Zap,
  Ellipsis,
  Edit,
} from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useTemplateGroups } from "@/hooks/useTemplateGroups";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseTemplate, TemplateAmount, TemplateGroup } from "@/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMobile } from "@/hooks/useMobile";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { DeleteTemplateDialog } from "@/components/templates/DeleteTemplateDialog";
import { GroupDialog } from "@/components/templates/GroupDialog";
import { DeleteGroupDialog } from "@/components/templates/DeleteGroupDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to format amounts display
export const formatAmountsDisplay = (amounts: TemplateAmount[]) => {
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {amounts.map((a, index) => (
        <p key={index} className="col-span-1 text-sm">
          {a.amount ? `${a.currency} ${a.amount.toLocaleString()}` : a.currency}
        </p>
      ))}
    </div>
  );
};

export default function Templates() {
  const isMobile = useMobile();
  const { t } = useTranslation();

  // Template dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ExpenseTemplate | null>(null);

  // Delete template dialog state
  const [isDeleteTemplateDialogOpen, setIsDeleteTemplateDialogOpen] =
    useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<ExpenseTemplate | null>(null);

  // Group dialog state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TemplateGroup | null>(null);

  // Delete group dialog state
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<TemplateGroup | null>(
    null,
  );

  const {
    data: templates,
    isLoading,
    refetch: refetchTemplates,
  } = useTemplates();
  const {
    data: groups,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
  } = useTemplateGroups();

  // Template handlers
  const handleOpenTemplateDialog = (template?: ExpenseTemplate) => {
    setEditingTemplate(template || null);
    setIsTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (template: ExpenseTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteTemplateDialogOpen(true);
  };

  const handleCloseDeleteTemplateDialog = () => {
    setIsDeleteTemplateDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Group handlers
  const handleOpenGroupDialog = (group?: TemplateGroup) => {
    setEditingGroup(group || null);
    setIsGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (group: TemplateGroup) => {
    setGroupToDelete(group);
    setIsDeleteGroupDialogOpen(true);
  };

  const handleCloseDeleteGroupDialog = () => {
    setIsDeleteGroupDialogOpen(false);
    setGroupToDelete(null);
  };

  // Helper to get template names for a group
  const getGroupTemplateNames = (templateIds: string[]): string => {
    if (!templates) return "";
    return templateIds
      .map((id) => templates.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const recurringTemplates = templates?.filter((t) => t.is_recurring) || [];
  const regularTemplates = templates?.filter((t) => !t.is_recurring) || [];

  const buttons: HeaderActionsGroups[] = [
    {
      group: "expenses",
      type: "dropdown",
      icon: Plus,
      actions: [
        {
          label: t("templates.createTemplate"),
          icon: Plus,
          onClick: () => handleOpenTemplateDialog(),
        },
        {
          label: t("groups.newGroup"),
          icon: FolderPlus,
          onClick: () => handleOpenGroupDialog(),
        },
      ],
    },
  ];

  const handleRefresh = async () => {
    await Promise.all([refetchTemplates(), refetchGroups()]);
  };

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col justify-start items-start gap-1">
          {!isMobile && (
            <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              {t("templates.title")}
            </h2>
          )}
          <div className="text-sm text-gray-600">
            {t("templates.description")}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Templates Section - Left side */}
        <div className="xl:col-span-2 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recurring Templates */}
              {recurringTemplates.length > 0 ? (
                <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t("templates.recurringBills")}
                    </CardTitle>
                    <CardDescription>
                      {t("templates.recurringBillsDesc")}
                    </CardDescription>
                    {!isMobile && (
                      <CardAction>
                        <Button
                          size="icon"
                          onClick={() => handleOpenTemplateDialog()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-0 p-0">
                    {recurringTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between gap-2 px-4 py-2 border-b hover:bg-primary/5"
                      >
                        <div className="flex flex-col items-start justify-start gap-2 w-full">
                          <p className="font-bold text-sm">{template.name}</p>
                          <div className="flex justify-between gap-2 w-full">
                            {formatAmountsDisplay(template.amounts)}
                            <p className="text-sm w-20">
                              {template.recurrence_day
                                ? `${t("common.day")} ${
                                    template.recurrence_day
                                  }`
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
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenTemplateDialog(template)
                                  }
                                >
                                  <Edit />
                                  {t("templates.editTemplate")}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteTemplate(template)}
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
                      {t("templates.totalTemplates")}:{" "}
                      {recurringTemplates.length}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden py-2 items-center justify-center">
                  <CardContent className="px-2">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <CircleOff />
                        </EmptyMedia>
                        <EmptyTitle>
                          {t("templates.noRecurringTemplates")}
                        </EmptyTitle>
                        <EmptyDescription>
                          {t("templates.noRecurringTemplatesDesc")}
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent className="flex-row justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenTemplateDialog()}
                        >
                          <Plus className="h-4 w-4" />
                          {t("templates.createRecurringTemplate")}
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </CardContent>
                </Card>
              )}

              {/* Regular Templates */}
              {regularTemplates.length > 0 ? (
                <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {t("templates.quickTemplates")}
                    </CardTitle>
                    <CardDescription>
                      {t("templates.quickTemplatesDesc")}
                    </CardDescription>
                    {!isMobile && (
                      <CardAction>
                        <Button
                          size="icon"
                          onClick={() => handleOpenTemplateDialog()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-4">
                            {t("templates.templateName")}
                          </TableHead>
                          <TableHead>
                            {t("templates.currenciesAmounts")}
                          </TableHead>
                          <TableHead className="w-24 pr-4">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularTemplates.map((template) => (
                          <TableRow
                            key={template.id}
                            className="hover:bg-primary/5"
                          >
                            <TableCell className="font-medium pl-4">
                              {template.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatAmountsDisplay(template.amounts)}
                            </TableCell>
                            <TableCell className="pr-4">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenTemplateDialog(template)
                                  }
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghostDestructive"
                                  size="icon"
                                  onClick={() => handleDeleteTemplate(template)}
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
                              {t("templates.totalTemplates")}:{" "}
                              {regularTemplates.length}
                            </p>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden py-2 items-center justify-center">
                  <CardContent className="px-2">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <CircleOff />
                        </EmptyMedia>
                        <EmptyTitle>
                          {t("templates.noQuickTemplates")}
                        </EmptyTitle>
                        <EmptyDescription>
                          {t("templates.noQuickTemplatesDesc")}
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent className="flex-row justify-center gap-2">
                        <Button onClick={() => handleOpenTemplateDialog()}>
                          <Plus className="h-4 w-4" />
                          {t("templates.createQuickTemplate")}
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Groups Section - Right side */}
        <div className="xl:col-span-1">
          {isLoadingGroups ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : groups && groups.length > 0 ? (
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
                      onClick={() => handleOpenGroupDialog()}
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
                          <h4 className="font-medium text-sm truncate">
                            {group.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {getGroupTemplateNames(group.template_ids) ||
                              "No templates"}
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
                            onClick={() => handleOpenGroupDialog(group)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghostDestructive"
                            size="icon"
                            onClick={() => handleDeleteGroup(group)}
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
          ) : (
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
                      <Button onClick={() => handleOpenGroupDialog()}>
                        <FolderPlus className="h-4 w-4" />
                        {t("groups.newGroup")}
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader actions={buttons} title={t("templates.title")} />
      )}
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>{content}</PullToRefresh>
      ) : (
        content
      )}

      {/* Template Dialog (Create/Edit) */}
      <TemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseTemplateDialog();
          else setIsTemplateDialogOpen(true);
        }}
        template={editingTemplate}
      />

      {/* Delete Template Dialog */}
      <DeleteTemplateDialog
        open={isDeleteTemplateDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteTemplateDialog();
          else setIsDeleteTemplateDialogOpen(true);
        }}
        template={templateToDelete}
      />

      {/* Group Dialog (Create/Edit) */}
      <GroupDialog
        open={isGroupDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseGroupDialog();
          else setIsGroupDialogOpen(true);
        }}
        group={editingGroup}
        templates={templates}
      />

      {/* Delete Group Dialog */}
      <DeleteGroupDialog
        open={isDeleteGroupDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteGroupDialog();
          else setIsDeleteGroupDialogOpen(true);
        }}
        group={groupToDelete}
      />
    </div>
  );
}
