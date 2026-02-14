import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FolderPlus } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useTemplateGroups } from "@/hooks/useTemplateGroups";
import { useMobile } from "@/hooks/useMobile";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import {
  TemplatesHeader,
  RecurringTemplatesCard,
  RegularTemplatesCard,
  TemplateGroupsCard,
  TemplatesLoadingSkeleton,
  GroupsLoadingSkeleton,
  TemplateDialog,
  DeleteTemplateDialog,
  GroupDialog,
  DeleteGroupDialog,
} from "@/components/templates";
import type { ExpenseTemplate, TemplateGroup } from "@/types";

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
    null
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
      <TemplatesHeader />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Templates Section - Left side */}
        <div className="xl:col-span-2 space-y-6">
          {isLoading ? (
            <TemplatesLoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecurringTemplatesCard
                templates={recurringTemplates}
                onEdit={handleOpenTemplateDialog}
                onDelete={handleDeleteTemplate}
                onCreate={() => handleOpenTemplateDialog()}
              />
              <RegularTemplatesCard
                templates={regularTemplates}
                onEdit={handleOpenTemplateDialog}
                onDelete={handleDeleteTemplate}
                onCreate={() => handleOpenTemplateDialog()}
              />
            </div>
          )}
        </div>

        {/* Groups Section - Right side */}
        <div className="xl:col-span-1">
          {isLoadingGroups ? (
            <GroupsLoadingSkeleton />
          ) : (
            <TemplateGroupsCard
              groups={groups || []}
              templates={templates}
              onEdit={handleOpenGroupDialog}
              onDelete={handleDeleteGroup}
              onCreate={() => handleOpenGroupDialog()}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader
          actions={buttons}
          title={t("templates.title")}
          hasAvatar={true}
        />
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
