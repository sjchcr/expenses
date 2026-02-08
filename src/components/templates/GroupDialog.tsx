import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateTemplateGroup,
  useUpdateTemplateGroup,
} from "@/hooks/useTemplateGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExpenseTemplate, TemplateGroup, TemplateAmount } from "@/types";
import { useMobile } from "@/hooks/useMobile";
import { Spinner } from "@/components/ui/spinner";

interface GroupFormData {
  name: string;
  template_ids: string[];
}

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: TemplateGroup | null;
  templates: ExpenseTemplate[] | undefined;
}

const createEmptyFormData = (): GroupFormData => ({
  name: "",
  template_ids: [],
});

const formatAmountsDisplay = (amounts: TemplateAmount[]) => {
  return (
    <div className="flex flex-col justify-start items-start gap-1">
      {amounts.map((a, index) => (
        <p key={index}>
          {a.amount ? `${a.currency} ${a.amount.toLocaleString()}` : a.currency}
        </p>
      ))}
    </div>
  );
};

export function GroupDialog({
  open,
  onOpenChange,
  group,
  templates,
}: GroupDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const createMutation = useCreateTemplateGroup();
  const updateMutation = useUpdateTemplateGroup();
  const [formData, setFormData] = useState<GroupFormData>(
    createEmptyFormData(),
  );

  const isEditing = !!group;

  useEffect(() => {
    if (open && group) {
      setFormData({
        name: group.name,
        template_ids: group.template_ids,
      });
    } else if (!open) {
      setFormData(createEmptyFormData());
    }
  }, [open, group]);

  const handleClose = () => {
    onOpenChange(false);
    setFormData(createEmptyFormData());
  };

  const handleTemplateToggle = (templateId: string) => {
    setFormData((prev) => ({
      ...prev,
      template_ids: prev.template_ids.includes(templateId)
        ? prev.template_ids.filter((id) => id !== templateId)
        : [...prev.template_ids, templateId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.template_ids.length === 0) {
      toast.error(t("groups.selectAtLeastOne"));
      return;
    }

    try {
      if (isEditing && group) {
        await updateMutation.mutateAsync({
          id: group.id,
          updates: formData,
        });
        toast.success(t("groups.groupUpdated"));
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t("groups.groupCreated"));
      }
      handleClose();
    } catch {
      toast.error(t("common.saving"));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={true}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>
            {isEditing ? t("groups.editGroup") : t("groups.createGroup")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("groups.editGroupDescription")
              : t("groups.createGroupDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto p-4"
        >
          <div>
            <Label htmlFor="group-name">{t("groups.groupName")} *</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("groups.groupNamePlaceholder")}
              required
            />
          </div>

          <div>
            <Label className="mb-2 block">
              {t("groups.selectTemplates")} *
            </Label>
            <div className="border rounded-lg max-h-64 bg-background overflow-y-auto">
              {templates && templates.length > 0 ? (
                <div className="divide-y">
                  {templates.map((template) => (
                    <label
                      key={template.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.template_ids.includes(template.id)}
                        onCheckedChange={() =>
                          handleTemplateToggle(template.id)
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
                  {t("groups.noTemplatesAvailable")}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 pl-3">
              {formData.template_ids.length === 1
                ? t("groups.templatesSelected", {
                    count: formData.template_ids.length,
                  })
                : t("groups.templatesSelectedPlural", {
                    count: formData.template_ids.length,
                  })}
            </p>
          </div>
        </form>
        {isMobile ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isLoading}
            className="absolute top-4 right-4"
          >
            {isLoading ? <Spinner /> : <Check />}
          </Button>
        ) : (
          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? t("common.saving")
                : isEditing
                ? t("common.update")
                : t("common.create")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
