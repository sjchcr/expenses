import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { useMobile } from "@/hooks/useMobile";
import {
  decimalToPercentage,
  percentageToDecimal,
} from "@/lib/stockCalculations";

interface SettingsFormData {
  us_tax_percentage: string;
  local_tax_percentage: string;
  broker_cost_usd: string;
}

interface StocksSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createEmptyFormData = (): SettingsFormData => ({
  us_tax_percentage: "25.67",
  local_tax_percentage: "15",
  broker_cost_usd: "7.5",
});

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
      });
    } else if (open && !settings) {
      setFormData(createEmptyFormData());
    }
  }, [open, settings]);

  const handleClose = () => {
    onOpenChange(false);
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

    try {
      await upsertMutation.mutateAsync({
        us_tax_percentage: percentageToDecimal(usTaxPercentage),
        local_tax_percentage: percentageToDecimal(localTaxPercentage),
        broker_cost_usd: brokerCostUsd,
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
