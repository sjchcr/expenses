import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useUpsertSalarySettings, useSalarySettings } from "@/hooks/useSalary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import type { SalaryDeduction, RentTaxBracket } from "@/types";
import {
  DEFAULT_SALARY_DEDUCTIONS,
  DEFAULT_RENT_TAX_BRACKETS,
  decimalToPercentage,
  percentageToDecimal,
} from "@/lib/salaryCalculations";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

// ── Deduction form helpers ──────────────────────────────────────────────────

interface DeductionFormItem {
  id: string;
  name: string;
  type: "percentage" | "nominal";
  amount: string;
}

function deductionsToForm(deductions: SalaryDeduction[]): DeductionFormItem[] {
  return deductions.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    amount:
      d.type === "percentage"
        ? decimalToPercentage(d.amount).toString()
        : d.amount.toString(),
  }));
}

function formToDeductions(items: DeductionFormItem[]): SalaryDeduction[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    amount:
      item.type === "percentage"
        ? percentageToDecimal(parseFloat(item.amount) || 0)
        : parseFloat(item.amount) || 0,
    active: true,
  }));
}

// ── Bracket form helpers ────────────────────────────────────────────────────

interface BracketFormItem {
  id: string;
  min: string;
  max: string; // empty = no limit
  rate: string;
}

function bracketsToForm(brackets: RentTaxBracket[]): BracketFormItem[] {
  return brackets.map((b) => ({
    id: b.id,
    min: b.min.toString(),
    max: b.max !== null ? b.max.toString() : "",
    rate: decimalToPercentage(b.rate).toString(),
  }));
}

function formToBrackets(items: BracketFormItem[]): RentTaxBracket[] {
  return items.map((item) => ({
    id: item.id,
    min: parseFloat(item.min) || 0,
    max: item.max.trim() !== "" ? parseFloat(item.max) : null,
    rate: percentageToDecimal(parseFloat(item.rate) || 0),
  }));
}

// ── Component ───────────────────────────────────────────────────────────────

interface SalarySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalarySettingsDialog({
  open,
  onOpenChange,
}: SalarySettingsDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const { data: settings } = useSalarySettings();
  const upsertMutation = useUpsertSalarySettings();
  const isLoading = upsertMutation.isPending;

  const [deductions, setDeductions] = useState<DeductionFormItem[]>([]);
  const [brackets, setBrackets] = useState<BracketFormItem[]>([]);

  useEffect(() => {
    if (open) {
      setDeductions(
        deductionsToForm(
          settings?.deductions?.length
            ? settings.deductions
            : DEFAULT_SALARY_DEDUCTIONS,
        ),
      );
      setBrackets(
        bracketsToForm(
          settings?.rent_tax_brackets?.length
            ? settings.rent_tax_brackets
            : DEFAULT_RENT_TAX_BRACKETS,
        ),
      );
    }
  }, [open, settings]);

  const handleSave = async () => {
    // Validate deductions
    for (const d of deductions) {
      if (!d.name.trim()) {
        toast.error(t("salary.deductionNameRequired"));
        return;
      }
      const amount = parseFloat(d.amount);
      if (isNaN(amount) || amount < 0) {
        toast.error(t("salary.invalidDeductionAmount"));
        return;
      }
      if (d.type === "percentage" && amount > 100) {
        toast.error(t("salary.invalidDeductionPercentage"));
        return;
      }
    }

    try {
      await upsertMutation.mutateAsync({
        deductions: formToDeductions(deductions),
        rent_tax_brackets: formToBrackets(brackets),
      });
      toast.success(t("salary.settingsSaved"));
      onOpenChange(false);
    } catch {
      toast.error(t("salary.settingsFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0" submitOnTop={isMobile}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>{t("salary.settings")}</DialogTitle>
          <DialogDescription>
            {t("salary.settingsDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="py-4 space-y-6">
            {/* Deduction templates */}
            <div className="flex flex-col gap-3">
              <div>
                <Label>{t("salary.deductionTemplates")}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("salary.deductionTemplatesDescription")}
                </p>
              </div>
              {deductions.map((d, i) => (
                <div key={d.id} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    value={d.name}
                    onChange={(e) => {
                      const next = [...deductions];
                      next[i] = { ...next[i], name: e.target.value };
                      setDeductions(next);
                    }}
                    placeholder={t("salary.deductionNamePlaceholder")}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant={d.type === "percentage" ? "default" : "outline"}
                    className="shrink-0 text-xs font-semibold"
                    onClick={() => {
                      const next = [...deductions];
                      next[i] = {
                        ...next[i],
                        type:
                          d.type === "percentage" ? "nominal" : "percentage",
                      };
                      setDeductions(next);
                    }}
                  >
                    {d.type === "percentage" ? "%" : "$"}
                  </Button>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={d.type === "percentage" ? "100" : undefined}
                    className="w-24 shrink-0"
                    value={d.amount}
                    onChange={(e) => {
                      const next = [...deductions];
                      next[i] = { ...next[i], amount: e.target.value };
                      setDeductions(next);
                    }}
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setDeductions(deductions.filter((_, j) => j !== i))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setDeductions([
                    ...deductions,
                    {
                      id: crypto.randomUUID(),
                      name: "",
                      type: "percentage",
                      amount: "",
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                {t("salary.addDeduction")}
              </Button>
            </div>

            <Separator />

            {/* Rent tax brackets */}
            <div className="flex flex-col gap-3">
              <div>
                <Label>{t("salary.rentTaxBrackets")}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("salary.rentTaxBracketsDescription")}
                </p>
              </div>

              {/* Headers */}
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium px-0">
                <span className="col-span-1">{t("salary.bracketFrom")}</span>
                <span className="col-span-1">{t("salary.bracketTo")}</span>
                <span className="col-span-1">{t("salary.bracketRate")}</span>
                <span />
              </div>

              {brackets.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={b.min}
                      onChange={(e) => {
                        const next = [...brackets];
                        next[i] = { ...next[i], min: e.target.value };
                        setBrackets(next);
                      }}
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={b.max}
                      onChange={(e) => {
                        const next = [...brackets];
                        next[i] = { ...next[i], max: e.target.value };
                        setBrackets(next);
                      }}
                      placeholder={t("salary.noLimit")}
                    />
                    <InputGroup className="bg-background hover:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:bg-input/30">
                      <InputGroupInput
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={b.rate}
                        onChange={(e) => {
                          const next = [...brackets];
                          next[i] = { ...next[i], rate: e.target.value };
                          setBrackets(next);
                        }}
                        placeholder="0"
                        className="pr-6 hover:bg-transparent"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>%</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setBrackets(brackets.filter((_, j) => j !== i))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setBrackets([
                    ...brackets,
                    { id: crypto.randomUUID(), min: "", max: "", rate: "" },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                {t("salary.addBracket")}
              </Button>
            </div>
          </div>
        </DialogBody>

        {isMobile ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSave}
            disabled={isLoading}
            className="absolute top-4 right-4"
          >
            {isLoading ? <Spinner /> : <Check />}
          </Button>
        ) : (
          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
