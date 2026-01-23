import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CircleOff,
  CalendarDays,
  FolderPlus,
  Layers,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/useTemplates";
import {
  useTemplateGroups,
  useCreateTemplateGroup,
  useUpdateTemplateGroup,
  useDeleteTemplateGroup,
} from "@/hooks/useTemplateGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseTemplate, TemplateAmount, TemplateGroup } from "@/types";

const COMMON_CURRENCIES = ["USD", "CRC", "COP", "MXN", "EUR", "GBP", "JPY"];

interface AmountFormData {
  currency: string;
  amount: string;
}

interface TemplateFormData {
  name: string;
  amounts: AmountFormData[];
  is_recurring: boolean;
  recurrence_day: number | null;
}

interface GroupFormData {
  name: string;
  template_ids: string[];
}

const createEmptyAmount = (): AmountFormData => ({
  currency: "USD",
  amount: "",
});

const createEmptyFormData = (): TemplateFormData => ({
  name: "",
  amounts: [createEmptyAmount()],
  is_recurring: false,
  recurrence_day: null,
});

const createEmptyGroupFormData = (): GroupFormData => ({
  name: "",
  template_ids: [],
});

// Helper to format amounts display
const formatAmountsDisplay = (amounts: TemplateAmount[]) => {
  return (
    <div className="flex flex-col justify-start items-start gap-1">
      {amounts.map((a) => {
        return (
          <p>
            {a.amount
              ? `${a.currency} ${a.amount.toLocaleString()}`
              : a.currency}
          </p>
        );
      })}
    </div>
  );
};

export default function Templates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ExpenseTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(
    createEmptyFormData(),
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<ExpenseTemplate | null>(null);

  // Group state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TemplateGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState<GroupFormData>(
    createEmptyGroupFormData(),
  );
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<TemplateGroup | null>(
    null,
  );

  const { data: templates, isLoading } = useTemplates();
  const { data: groups, isLoading: isLoadingGroups } = useTemplateGroups();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();
  const createGroupMutation = useCreateTemplateGroup();
  const updateGroupMutation = useUpdateTemplateGroup();
  const deleteGroupMutation = useDeleteTemplateGroup();

  const handleOpenDialog = (template?: ExpenseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        amounts: template.amounts.map((a) => ({
          currency: a.currency,
          amount: a.amount?.toString() || "",
        })),
        is_recurring: template.is_recurring || false,
        recurrence_day: template.recurrence_day,
      });
    } else {
      setEditingTemplate(null);
      setFormData(createEmptyFormData());
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData(createEmptyFormData());
  };

  const handleAddAmount = () => {
    setFormData({
      ...formData,
      amounts: [...formData.amounts, createEmptyAmount()],
    });
  };

  const handleRemoveAmount = (index: number) => {
    if (formData.amounts.length > 1) {
      setFormData({
        ...formData,
        amounts: formData.amounts.filter((_, i) => i !== index),
      });
    }
  };

  const handleAmountChange = (
    index: number,
    field: keyof AmountFormData,
    value: string,
  ) => {
    const newAmounts = [...formData.amounts];
    newAmounts[index] = { ...newAmounts[index], [field]: value };
    setFormData({ ...formData, amounts: newAmounts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateAmounts: TemplateAmount[] = formData.amounts
      .filter((a) => a.currency)
      .map((a) => ({
        currency: a.currency,
        amount: a.amount ? parseFloat(a.amount) : null,
      }));

    if (templateAmounts.length === 0) {
      toast.error("Please add at least one currency.");
      return;
    }

    const templateData = {
      name: formData.name,
      amounts: templateAmounts,
      is_recurring: formData.is_recurring,
      recurrence_day: formData.is_recurring ? formData.recurrence_day : null,
    };

    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          updates: templateData,
        });
        toast.success("Template updated successfully");
      } else {
        await createMutation.mutateAsync(templateData);
        toast.success("Template created successfully");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template. Please try again.");
    }
  };

  const handleDelete = (template: ExpenseTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      try {
        await deleteMutation.mutateAsync(templateToDelete.id);
        toast.success("Template deleted successfully");
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast.error("Failed to delete template. Please try again.");
      }
    }
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  // Group handlers
  const handleOpenGroupDialog = (group?: TemplateGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData({
        name: group.name,
        template_ids: group.template_ids,
      });
    } else {
      setEditingGroup(null);
      setGroupFormData(createEmptyGroupFormData());
    }
    setIsGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setEditingGroup(null);
    setGroupFormData(createEmptyGroupFormData());
  };

  const handleGroupTemplateToggle = (templateId: string) => {
    setGroupFormData((prev) => ({
      ...prev,
      template_ids: prev.template_ids.includes(templateId)
        ? prev.template_ids.filter((id) => id !== templateId)
        : [...prev.template_ids, templateId],
    }));
  };

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (groupFormData.template_ids.length === 0) {
      toast.error("Please select at least one template for the group.");
      return;
    }

    try {
      if (editingGroup) {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id,
          updates: groupFormData,
        });
        toast.success("Group updated successfully");
      } else {
        await createGroupMutation.mutateAsync(groupFormData);
        toast.success("Group created successfully");
      }
      handleCloseGroupDialog();
    } catch (error) {
      console.error("Failed to save group:", error);
      toast.error("Failed to save group. Please try again.");
    }
  };

  const handleDeleteGroup = (group: TemplateGroup) => {
    setGroupToDelete(group);
    setIsDeleteGroupDialogOpen(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        await deleteGroupMutation.mutateAsync(groupToDelete.id);
        toast.success("Group deleted successfully");
        setIsDeleteGroupDialogOpen(false);
        setGroupToDelete(null);
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast.error("Failed to delete group. Please try again.");
      }
    }
  };

  const isGroupFormLoading =
    createGroupMutation.isPending || updateGroupMutation.isPending;

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

  return (
    <div className="w-full mx-auto py-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Templates
            </h2>
            <div className="text-sm text-gray-600">
              Create and manage expense templates for quick expense creation.
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Add template
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Templates Section - Left side */}
          <div className="xl:col-span-2 space-y-6">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recurring Templates */}
                {recurringTemplates.length > 0 ? (
                  <Card className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden gap-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Recurring Bills
                      </CardTitle>
                      <CardDescription>
                        Templates for recurring expenses billed on a regular
                        basis.
                      </CardDescription>
                      <CardAction>
                        <Button size="icon" onClick={() => handleOpenDialog()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Currencies / Amounts</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recurringTemplates.map((template) => (
                            <TableRow key={template.id}>
                              <TableCell className="font-medium">
                                <p className="font-bold">{template.name}</p>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatAmountsDisplay(template.amounts)}
                              </TableCell>
                              <TableCell>
                                {template.recurrence_day
                                  ? `Day ${template.recurrence_day}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(template)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(template)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden py-2 items-center justify-center">
                    <CardContent className="px-2">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="flex flex-col justify-center items-center gap-2 text-md text-gray-500">
                          <CircleOff className="h-6 w-6" />
                          No recurring templates found
                        </p>
                        <p className="flex flex-col text-center gap-2 text-sm text-gray-500 max-w-2/3">
                          A recurring template is a template that repeats on a
                          specific day of the month.
                        </p>
                        <Button onClick={() => handleOpenDialog()}>
                          <Plus className="h-4 w-4" />
                          Create a recurring template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Regular Templates */}
                {regularTemplates.length > 0 ? (
                  <Card className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden gap-2 py-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Quick Templates
                      </CardTitle>
                      <CardDescription>
                        Templates for one-time or non-recurring expenses. No set
                        billing date.
                      </CardDescription>
                      <CardAction>
                        <Button size="icon" onClick={() => handleOpenDialog()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Currencies / Amounts</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {regularTemplates.map((template) => (
                            <TableRow key={template.id}>
                              <TableCell className="font-medium">
                                {template.name}
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatAmountsDisplay(template.amounts)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(template)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(template)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden py-2 items-center justify-center">
                    <CardContent className="px-2">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="flex flex-col justify-center items-center gap-2 text-md text-gray-500">
                          <CircleOff className="h-6 w-6" />
                          No quick templates found
                        </p>
                        <p className="flex flex-col text-center gap-2 text-sm text-gray-500 max-w-2/3">
                          A quick template is a one-time expense template
                          without a set billing date.
                        </p>
                        <Button onClick={() => handleOpenDialog()}>
                          <Plus className="h-4 w-4" />
                          Create a quick template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Groups Section - Right side */}
          <div className="xl:col-span-1">
            <Card className="bg-linear-to-b from-white to-gray-100 border border-gray-200 shadow-md rounded-xl overflow-hidden gap-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Template Groups
                </CardTitle>
                <CardDescription>
                  Organize templates into groups for batch expense creation.
                </CardDescription>
                <CardAction>
                  <Button
                    size="icon"
                    onClick={() => handleOpenGroupDialog()}
                    disabled={!templates || templates.length === 0}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoadingGroups ? (
                  <Skeleton className="h-20 w-full" />
                ) : groups && groups.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {group.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {getGroupTemplateNames(group.template_ids) ||
                                "No templates"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {group.template_ids.length} template
                              {group.template_ids.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenGroupDialog(group)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleDeleteGroup(group)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">
                      {templates && templates.length > 0
                        ? "Create groups to batch-create expenses"
                        : "Create templates first to make groups"}
                    </p>
                    {templates && templates.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenGroupDialog()}
                      >
                        <FolderPlus className="h-4 w-4 mr-1" />
                        New Group
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Rent, Netflix, Electricity"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Currencies / Amounts</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddAmount}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Currency
                </Button>
              </div>
              <div className="space-y-3">
                {formData.amounts.map((amountData, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[100px_1fr_auto] gap-2 items-end"
                  >
                    <Select
                      value={amountData.currency}
                      onValueChange={(value) =>
                        handleAmountChange(index, "currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-60">
                        {COMMON_CURRENCIES.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountData.amount}
                      onChange={(e) =>
                        handleAmountChange(index, "amount", e.target.value)
                      }
                      placeholder="Amount (optional)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAmount(index)}
                      disabled={formData.amounts.length === 1}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Amount is optional. If provided, it will be pre-filled when
                creating expenses from this template.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    is_recurring: checked as boolean,
                    recurrence_day: checked
                      ? formData.recurrence_day || 1
                      : null,
                  })
                }
              />
              <Label htmlFor="is_recurring">This is a recurring bill</Label>
            </div>

            {formData.is_recurring && (
              <div>
                <Label htmlFor="recurrence_day">Recurrence Day *</Label>
                <Select
                  value={String(formData.recurrence_day || 1)}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      recurrence_day: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger id="recurrence_day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        Day {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  The day of the month when this bill is due
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isFormLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading
                  ? "Saving..."
                  : editingTemplate
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{templateToDelete?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Create Group"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitGroup} className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                value={groupFormData.name}
                onChange={(e) =>
                  setGroupFormData({ ...groupFormData, name: e.target.value })
                }
                placeholder="e.g., Monthly Bills, Subscriptions"
                required
              />
            </div>

            <div>
              <Label className="mb-2 block">Select Templates *</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {templates && templates.length > 0 ? (
                  <div className="divide-y">
                    {templates.map((template) => (
                      <label
                        key={template.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={groupFormData.template_ids.includes(
                            template.id,
                          )}
                          onCheckedChange={() =>
                            handleGroupTemplateToggle(template.id)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatAmountsDisplay(template.amounts)}
                          </div>
                        </div>
                        {template.is_recurring && (
                          <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No templates available
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {groupFormData.template_ids.length} template
                {groupFormData.template_ids.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseGroupDialog}
                disabled={isGroupFormLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGroupFormLoading}>
                {isGroupFormLoading
                  ? "Saving..."
                  : editingGroup
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog
        open={isDeleteGroupDialogOpen}
        onOpenChange={setIsDeleteGroupDialogOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{groupToDelete?.name}"? This action
            cannot be undone. The templates in this group will not be deleted.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteGroupDialogOpen(false);
                setGroupToDelete(null);
              }}
              disabled={deleteGroupMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteGroup}
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
