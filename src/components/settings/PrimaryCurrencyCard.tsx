import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Coins } from "lucide-react";
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMMON_CURRENCIES } from "./constants";

interface PrimaryCurrencyCardProps {
  initialCurrency: string;
}

export function PrimaryCurrencyCard({
  initialCurrency,
}: PrimaryCurrencyCardProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateSettings();
  const [primaryCurrency, setPrimaryCurrency] = useState(initialCurrency);

  useEffect(() => {
    setPrimaryCurrency(initialCurrency);
  }, [initialCurrency]);

  const handleSavePrimaryCurrency = async () => {
    try {
      await updateMutation.mutateAsync({ primary_currency: primaryCurrency });
      toast.success("Primary currency updated");
    } catch {
      toast.error("Failed to update primary currency");
    }
  };

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          {t("settings.primaryCurrency")}
        </CardTitle>
        <CardDescription>{t("settings.primaryCurrencyDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="primary-currency">{t("common.currency")}</Label>
          <Select value={primaryCurrency} onValueChange={setPrimaryCurrency}>
            <SelectTrigger id="primary-currency" className="mt-1 w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {COMMON_CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={handleSavePrimaryCurrency}
          disabled={
            updateMutation.isPending || primaryCurrency === initialCurrency
          }
        >
          {updateMutation.isPending
            ? t("common.saving")
            : t("settings.saveCurrency")}
        </Button>
      </CardContent>
    </Card>
  );
}
