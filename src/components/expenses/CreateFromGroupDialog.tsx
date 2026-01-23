import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Layers, Check, AlertCircle, ChevronDownIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTemplateGroups } from "@/hooks/useTemplateGroups";
import { useTemplates } from "@/hooks/useTemplates";
import { useCreateExpense } from "@/hooks/useExpenses";
import { expensesService } from "@/services/expenses.service";
import type { PaymentPeriod, ExpenseTemplate } from "@/types";

interface CreateFromGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentPeriods: PaymentPeriod[];
}

interface CreationStatus {
  templateId: string;
  templateName: string;
  status: "pending" | "creating" | "success" | "error";
  error?: string;
}

export function CreateFromGroupDialog({
  open,
  onOpenChange,
  paymentPeriods,
}: CreateFromGroupDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [baseDate, setBaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatuses, setCreationStatuses] = useState<CreationStatus[]>(
    [],
  );

  const { data: groups } = useTemplateGroups();
  const { data: templates } = useTemplates();
  const createMutation = useCreateExpense();

  const selectedGroup = groups?.find((g) => g.id === selectedGroupId);

  // Get templates in the selected group
  const groupTemplates = selectedGroup
    ? templates?.filter((t) => selectedGroup.template_ids.includes(t.id)) || []
    : [];

  // Get only selected templates for creation
  const templatesToCreate = groupTemplates.filter((t) =>
    selectedTemplateIds.includes(t.id),
  );

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedGroupId("");
      setSelectedTemplateIds([]);
      setBaseDate(format(new Date(), "yyyy-MM-dd"));
      setCreationStatuses([]);
      setIsCreating(false);
    }
  }, [open]);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCreationStatuses([]);
    // Select all templates by default when group is selected
    const group = groups?.find((g) => g.id === groupId);
    if (group) {
      setSelectedTemplateIds(group.template_ids);
    }
  };

  const getDueDateForTemplate = (template: ExpenseTemplate): string => {
    if (template.is_recurring && template.recurrence_day) {
      const baseDateObj = parseISO(baseDate);
      return format(
        new Date(
          baseDateObj.getFullYear(),
          baseDateObj.getMonth(),
          template.recurrence_day,
        ),
        "yyyy-MM-dd",
      );
    }
    return baseDate;
  };

  const handleCreate = async () => {
    if (!selectedGroup || templatesToCreate.length === 0) return;

    setIsCreating(true);

    // Initialize creation statuses only for selected templates
    const initialStatuses: CreationStatus[] = templatesToCreate.map((t) => ({
      templateId: t.id,
      templateName: t.name,
      status: "pending",
    }));
    setCreationStatuses(initialStatuses);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < templatesToCreate.length; i++) {
      const template = templatesToCreate[i];

      // Update status to creating
      setCreationStatuses((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "creating" } : s)),
      );

      try {
        const dueDate = getDueDateForTemplate(template);
        const parsedDueDate = parseISO(dueDate);
        const paymentPeriod = expensesService.getPaymentPeriod(
          parsedDueDate,
          paymentPeriods,
        );

        // Create expense from template
        const expenseData = {
          name: template.name,
          due_date: dueDate,
          is_paid: false,
          payment_period: paymentPeriod,
          amounts: template.amounts.map((a) => ({
            currency: a.currency,
            amount: a.amount || 0,
            exchange_rate: null,
            exchange_rate_source: null,
          })),
          template_id: template.id,
        };

        await createMutation.mutateAsync(expenseData);

        // Update status to success
        setCreationStatuses((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "success" } : s)),
        );
        successCount++;
      } catch (error) {
        // Update status to error
        setCreationStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Failed to create",
                }
              : s,
          ),
        );
        errorCount++;
      }
    }

    setIsCreating(false);

    if (successCount > 0) {
      toast.success(
        `Created ${successCount} expense${successCount > 1 ? "s" : ""}`,
      );
    }
    if (errorCount > 0) {
      toast.error(
        `Failed to create ${errorCount} expense${errorCount > 1 ? "s" : ""}`,
      );
    }

    // Close dialog after a short delay to show final statuses
    if (errorCount === 0) {
      setTimeout(() => onOpenChange(false), 1000);
    }
  };

  const hasNoGroups = !groups || groups.length === 0;
  const hasCreationStarted = creationStatuses.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Create from Group
          </DialogTitle>
        </DialogHeader>

        {hasNoGroups ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">No template groups available.</p>
            <p className="text-sm text-gray-400">
              Create groups in the Templates page first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="group">Select Group *</Label>
              <Select
                value={selectedGroupId}
                onValueChange={handleGroupSelect}
                disabled={isCreating}
              >
                <SelectTrigger id="group" className="mt-1">
                  <SelectValue placeholder="Choose a group..." />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.template_ids.length} templates)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroup && (
              <>
                <div>
                  <Label htmlFor="base-date">Base Date</Label>
                  <p className="text-xs text-gray-500 mb-1">
                    For recurring templates, their recurrence day will be used
                    instead.
                  </p>
                  <Popover
                    open={openDatePicker}
                    onOpenChange={setOpenDatePicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="base-date"
                        className="w-full justify-between font-normal"
                        disabled={isCreating}
                      >
                        {baseDate}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-fit overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={parseISO(baseDate)}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            setBaseDate(format(date, "yyyy-MM-dd"));
                            setOpenDatePicker(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Templates to Create</Label>
                  <div className="mt-1 border rounded-lg max-h-48 overflow-y-auto">
                    {groupTemplates.length > 0 ? (
                      <div className="divide-y">
                        {groupTemplates.map((template, idx) => {
                          const status = creationStatuses[idx];
                          return (
                            <div
                              key={template.id}
                              className="flex items-center justify-between px-3 py-2"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {template.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {template.amounts
                                    .map((a) =>
                                      a.amount
                                        ? `${a.currency} ${a.amount.toLocaleString()}`
                                        : a.currency,
                                    )
                                    .join(", ")}
                                </div>
                              </div>
                              {status && (
                                <div className="ml-2">
                                  {status.status === "creating" && (
                                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                  )}
                                  {status.status === "success" && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                  {status.status === "error" && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-3 py-4 text-sm text-gray-500 text-center">
                        No templates found in this group
                      </p>
                    )}
                  </div>
                  {groupTemplates.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {groupTemplates.length} expense
                      {groupTemplates.length > 1 ? "s" : ""} will be created
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                {hasCreationStarted ? "Close" : "Cancel"}
              </Button>
              {!hasCreationStarted && (
                <Button
                  onClick={handleCreate}
                  disabled={
                    !selectedGroup || groupTemplates.length === 0 || isCreating
                  }
                >
                  {isCreating ? "Creating..." : "Create Expenses"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
