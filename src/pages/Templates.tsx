import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Shapes, WalletCards } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useCategories } from "@/hooks/useCategories";
import { useExpenseBuckets } from "@/hooks/useExpenseBuckets";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useMobile } from "@/hooks/useMobile";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import CustomHeader, {
  type HeaderActionsGroups,
} from "@/components/common/CustomHeader";
import {
  TemplatesHeader,
  RecurringTemplatesCard,
  RegularTemplatesCard,
  TemplatesLoadingSkeleton,
  GroupsLoadingSkeleton,
  TemplateDialog,
  DeleteTemplateDialog,
} from "@/components/templates";
import {
  CategoriesCard,
  CategoryDialog,
  DeleteCategoryDialog,
} from "@/components/categories";
import {
  BucketDialog,
  BucketsCard,
  DeleteBucketDialog,
} from "@/components/buckets";
import type { ExpenseBucket, ExpenseCategory, ExpenseTemplate } from "@/types";

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

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);

  // Delete category dialog state
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<ExpenseCategory | null>(null);

  // Bucket dialog state
  const [isBucketDialogOpen, setIsBucketDialogOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<ExpenseBucket | null>(
    null,
  );

  // Delete bucket dialog state
  const [isDeleteBucketDialogOpen, setIsDeleteBucketDialogOpen] =
    useState(false);
  const [bucketToDelete, setBucketToDelete] = useState<ExpenseBucket | null>(
    null,
  );

  const {
    data: templates,
    isLoading,
    refetch: refetchTemplates,
  } = useTemplates();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useCategories();
  const {
    data: buckets,
    isLoading: isLoadingBuckets,
    refetch: refetchBuckets,
  } = useExpenseBuckets();
  const { settings } = useUserSettings();

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

  // Category handlers
  const handleOpenCategoryDialog = (category?: ExpenseCategory) => {
    setEditingCategory(category || null);
    setIsCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (category: ExpenseCategory) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleCloseDeleteCategoryDialog = () => {
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Bucket handlers
  const handleOpenBucketDialog = (bucket?: ExpenseBucket) => {
    setEditingBucket(bucket || null);
    setIsBucketDialogOpen(true);
  };

  const handleCloseBucketDialog = () => {
    setIsBucketDialogOpen(false);
    setEditingBucket(null);
  };

  const handleDeleteBucket = (bucket: ExpenseBucket) => {
    setBucketToDelete(bucket);
    setIsDeleteBucketDialogOpen(true);
  };

  const handleCloseDeleteBucketDialog = () => {
    setIsDeleteBucketDialogOpen(false);
    setBucketToDelete(null);
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
          label: t("categories.create"),
          icon: Shapes,
          onClick: () => handleOpenCategoryDialog(),
        },
        {
          label: t("buckets.create"),
          icon: WalletCards,
          onClick: () => handleOpenBucketDialog(),
        },
      ],
    },
  ];

  const handleRefresh = async () => {
    await Promise.all([
      refetchTemplates(),
      refetchCategories(),
      refetchBuckets(),
    ]);
  };

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      <TemplatesHeader />

      <div className="flex flex-col gap-6">
        {/* Templates Section */}
        <div className="space-y-6">
          {isLoading ? (
            <TemplatesLoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecurringTemplatesCard
                templates={recurringTemplates}
                onEdit={handleOpenTemplateDialog}
                onDelete={handleDeleteTemplate}
                onCreate={() => handleOpenTemplateDialog()}
                categories={categories || []}
              />
              <RegularTemplatesCard
                templates={regularTemplates}
                onEdit={handleOpenTemplateDialog}
                onDelete={handleDeleteTemplate}
                onCreate={() => handleOpenTemplateDialog()}
                categories={categories || []}
              />
              {isLoadingCategories ? (
                <GroupsLoadingSkeleton />
              ) : (
                <CategoriesCard
                  categories={categories || []}
                  onEdit={handleOpenCategoryDialog}
                  onDelete={handleDeleteCategory}
                  onCreate={() => handleOpenCategoryDialog()}
                />
              )}
              {isLoadingBuckets ? (
                <GroupsLoadingSkeleton />
              ) : (
                <BucketsCard
                  buckets={buckets || []}
                  categories={categories || []}
                  onEdit={handleOpenBucketDialog}
                  onDelete={handleDeleteBucket}
                  onCreate={() => handleOpenBucketDialog()}
                />
              )}
            </div>
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

      {/* Category Dialog (Create/Edit) */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCategoryDialog();
          else setIsCategoryDialogOpen(true);
        }}
        category={editingCategory}
      />

      {/* Delete Category Dialog */}
      <DeleteCategoryDialog
        open={isDeleteCategoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteCategoryDialog();
          else setIsDeleteCategoryDialogOpen(true);
        }}
        category={categoryToDelete}
      />

      {/* Bucket Dialog (Create/Edit) */}
      <BucketDialog
        open={isBucketDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseBucketDialog();
          else setIsBucketDialogOpen(true);
        }}
        bucket={editingBucket}
        categories={categories || []}
        defaultCurrency={settings?.primary_currency || "USD"}
      />

      {/* Delete Bucket Dialog */}
      <DeleteBucketDialog
        open={isDeleteBucketDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteBucketDialog();
          else setIsDeleteBucketDialogOpen(true);
        }}
        bucket={bucketToDelete}
      />
    </div>
  );
}
