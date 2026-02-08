import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useUpdateSettings } from "@/hooks/useUserSettings";
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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaymentPeriod } from "@/types";

interface PaymentPeriodsCardProps {
  initialPeriods: PaymentPeriod[];
}

export function PaymentPeriodsCard({
  initialPeriods,
}: PaymentPeriodsCardProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateSettings();
  const [paymentPeriods, setPaymentPeriods] =
    useState<PaymentPeriod[]>(initialPeriods);

  useEffect(() => {
    setPaymentPeriods(initialPeriods);
  }, [initialPeriods]);

  const handleAddPeriod = () => {
    const lastPeriod = paymentPeriods[paymentPeriods.length - 1];
    const newPeriod: PaymentPeriod = {
      period: lastPeriod.period + 1,
      start_day: lastPeriod.end_day + 1,
      end_day: Math.min(lastPeriod.end_day + 15, 31),
    };
    setPaymentPeriods([...paymentPeriods, newPeriod]);
  };

  const handleRemovePeriod = (index: number) => {
    if (paymentPeriods.length > 1) {
      const newPeriods = paymentPeriods.filter((_, i) => i !== index);
      const renumbered = newPeriods.map((p, i) => ({ ...p, period: i + 1 }));
      setPaymentPeriods(renumbered);
    }
  };

  const handlePeriodChange = (
    index: number,
    field: "start_day" | "end_day",
    value: number,
  ) => {
    const newPeriods = [...paymentPeriods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setPaymentPeriods(newPeriods);
  };

  const handleSavePaymentPeriods = async () => {
    const sortedPeriods = [...paymentPeriods].sort(
      (a, b) => a.start_day - b.start_day,
    );

    for (let i = 0; i < sortedPeriods.length; i++) {
      const period = sortedPeriods[i];
      if (period.start_day > period.end_day) {
        toast.error(t("settings.startBeforeEnd", { period: period.period }));
        return;
      }
      if (i > 0) {
        const prevPeriod = sortedPeriods[i - 1];
        if (period.start_day <= prevPeriod.end_day) {
          toast.error(t("settings.periodsCannotOverlap"));
          return;
        }
      }
    }

    try {
      await updateMutation.mutateAsync({ payment_periods: paymentPeriods });
      toast.success("Payment periods updated");
    } catch {
      toast.error("Failed to update payment periods");
    }
  };

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t("settings.paymentPeriods")}
        </CardTitle>
        <CardDescription>{t("settings.paymentPeriodsDesc")}</CardDescription>
        <CardAction>
          <Button type="button" size="icon" onClick={handleAddPeriod}>
            <Plus />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {paymentPeriods.map((period, index) => (
            <div
              key={index}
              className="flex items-center gap-2 border border-gray-200 dark:border-gray-900 rounded-lg p-2 bg-background"
            >
              <span className="text-sm font-medium w-20">
                {t("settings.period")} {period.period}
              </span>
              <div className="flex items-center gap-2">
                <Label className="text-xs">{t("common.day")}</Label>
                <Select
                  value={`${period.start_day}`}
                  onValueChange={(value) =>
                    handlePeriodChange(index, "start_day", parseInt(value) || 1)
                  }
                >
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs">{t("common.to")}</span>
                <Select
                  value={`${period.end_day}`}
                  onValueChange={(value) =>
                    handlePeriodChange(index, "end_day", parseInt(value) || 31)
                  }
                >
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghostDestructive"
                size="sm"
                onClick={() => handleRemovePeriod(index)}
                disabled={paymentPeriods.length === 1}
                className="h-8 w-8 p-0 ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 w-full">
          <Button
            className="w-full sm:w-auto"
            onClick={handleSavePaymentPeriods}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? t("common.saving")
              : t("settings.savePeriods")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
