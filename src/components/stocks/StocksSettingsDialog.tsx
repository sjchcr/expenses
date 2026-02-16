import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useStocksSettings, useUpsertStocksSettings } from "@/hooks/useStocks";
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
import type { StockDeduction } from "@/types";
import {
  decimalToPercentage,
  percentageToDecimal,
} from "@/lib/stockCalculations";

interface DeductionFormItem {
  id: string;
  name: string;
  type: "percentage" | "nominal";
  amount: string;
}

interface SettingsFormData {
  us_tax_percentage: string;
  local_tax_percentage: string;
  broker_cost_usd: string;
  other_deductions: DeductionFormItem[];
}

interface StocksSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createEmptyFormData = (): SettingsFormData => ({
  us_tax_percentage: "25.67",
  local_tax_percentage: "15",
  broker_cost_usd: "7.5",
  other_deductions: [],
});

function deductionsToForm(deductions: StockDeduction[]): DeductionFormItem[] {
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

function formToDeductions(items: DeductionFormItem[]): StockDeduction[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    amount:
      item.type === "percentage"
        ? percentageToDecimal(parseFloat(item.amount) || 0)
        : parseFloat(item.amount) || 0,
  }));
}

export function StocksSettingsDialog({
  open,
  onOpenChange,
}: StocksSettingsDialogProps) {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { data: settings } = useStocksSettings();
  const upsertMutation = useUpsertStocksSettings();
  const [formData, setFormData] = useState<SettingsFormData>(
    createEmptyFormData(),
  );

  useEffect(() => {
    if (open && settings) {
      setFormData({
        us_tax_percentage: decimalToPercentage(
          settings.us_tax_percentage,
        ).toString(),
        local_tax_percentage: decimalToPercentage(
          settings.local_tax_percentage,
        ).toString(),
        broker_cost_usd: settings.broker_cost_usd.toString(),
        other_deductions: deductionsToForm(settings.other_deductions ?? []),
      });
    } else if (open && !settings) {
      setFormData(createEmptyFormData());
    }
  }, [open, settings]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleAddDeduction = () => {
    setFormData({
      ...formData,
      other_deductions: [
        ...formData.other_deductions,
        {
          id: crypto.randomUUID(),
          name: "",
          type: "percentage",
          amount: "",
        },
      ],
    });
  };

  const handleRemoveDeduction = (id: string) => {
    setFormData({
      ...formData,
      other_deductions: formData.other_deductions.filter((d) => d.id !== id),
    });
  };

  const handleDeductionChange = (
    id: string,
    field: keyof DeductionFormItem,
    value: string,
  ) => {
    setFormData({
      ...formData,
      other_deductions: formData.other_deductions.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usTaxPercentage = parseFloat(formData.us_tax_percentage);
    const localTaxPercentage = parseFloat(formData.local_tax_percentage);
    const brokerCostUsd = parseFloat(formData.broker_cost_usd);

    if (
      isNaN(usTaxPercentage) ||
      usTaxPercentage < 0 ||
      usTaxPercentage > 100
    ) {
      toast.error(t("stocks.invalidUsTax"));
      return;
    }

    if (
      isNaN(localTaxPercentage) ||
      localTaxPercentage < 0 ||
      localTaxPercentage > 100
    ) {
      toast.error(t("stocks.invalidLocalTax"));
      return;
    }

    if (isNaN(brokerCostUsd) || brokerCostUsd < 0) {
      toast.error(t("stocks.invalidBrokerCost"));
      return;
    }

    // Validate deductions
    for (const d of formData.other_deductions) {
      if (!d.name.trim()) {
        toast.error(t("stocks.deductionNameRequired"));
        return;
      }
      const amount = parseFloat(d.amount);
      if (isNaN(amount) || amount < 0) {
        toast.error(t("stocks.invalidDeductionAmount"));
        return;
      }
      if (d.type === "percentage" && amount > 100) {
        toast.error(t("stocks.invalidDeductionPercentage"));
        return;
      }
    }

    try {
      await upsertMutation.mutateAsync({
        us_tax_percentage: percentageToDecimal(usTaxPercentage),
        local_tax_percentage: percentageToDecimal(localTaxPercentage),
        broker_cost_usd: brokerCostUsd,
        other_deductions: formToDeductions(formData.other_deductions),
      });
      toast.success(t("stocks.settingsSaved"));
      handleClose();
    } catch {
      toast.error(t("stocks.settingsFailed"));
    }
  };

  const isLoading = upsertMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0" submitOnTop={true}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>{t("stocks.settings")}</DialogTitle>
          <DialogDescription>
            {t("stocks.settingsDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="us_tax_percentage">
                {t("stocks.usTaxPercentage")}
              </Label>
              <div className="relative">
                <Input
                  id="us_tax_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.us_tax_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      us_tax_percentage: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-3">
                {t("stocks.usTaxHint")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="local_tax_percentage">
                {t("stocks.localTaxPercentage")}
              </Label>
              <div className="relative">
                <Input
                  id="local_tax_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.local_tax_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      local_tax_percentage: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-3">
                {t("stocks.localTaxHint")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="broker_cost_usd">
                {t("stocks.brokerCostUsd")}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="broker_cost_usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.broker_cost_usd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      broker_cost_usd: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground pl-3">
                {t("stocks.brokerCostHint")}
              </p>
            </div>

            <Separator />

            {/* Other Deductions */}
            <div className="flex flex-col gap-3">
              <Label>{t("stocks.otherDeductions")}</Label>
              <p className="text-xs text-muted-foreground pl-3">
                {t("stocks.otherDeductionsDescription")}
              </p>
              {formData.other_deductions.map((deduction) => (
                <div key={deduction.id} className="flex items-center gap-2">
                  <Input
                    value={deduction.name}
                    onChange={(e) =>
                      handleDeductionChange(
                        deduction.id,
                        "name",
                        e.target.value,
                      )
                    }
                    placeholder={t("stocks.deductionNamePlaceholder")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={
                      deduction.type === "percentage" ? "default" : "outline"
                    }
                    size="icon"
                    className="shrink-0 w-9 h-9 text-xs font-semibold"
                    onClick={() =>
                      handleDeductionChange(
                        deduction.id,
                        "type",
                        deduction.type === "percentage"
                          ? "nominal"
                          : "percentage",
                      )
                    }
                  >
                    {deduction.type === "percentage" ? "%" : "$"}
                  </Button>
                  <div className="relative w-24 shrink-0">
                    <Input
                      type="number"
                      step={deduction.type === "percentage" ? "0.1" : "0.01"}
                      min="0"
                      max={deduction.type === "percentage" ? "100" : undefined}
                      value={deduction.amount}
                      onChange={(e) =>
                        handleDeductionChange(
                          deduction.id,
                          "amount",
                          e.target.value,
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 w-9 h-9 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveDeduction(deduction.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDeduction}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                {t("stocks.addDeduction")}
              </Button>
            </div>
          </form>
        </DialogBody>
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
              variant="outline"
              className="w-full"
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
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
