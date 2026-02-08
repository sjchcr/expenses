import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import i18n, { changeLanguage } from "@/lib/i18n";
import { useUpdateSettings } from "@/hooks/useUserSettings";
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

export function LanguageCard() {
  const { t } = useTranslation();
  const updateMutation = useUpdateSettings();

  const handleLanguageChange = async (lng: string) => {
    await changeLanguage(lng);
    updateMutation.mutate({ language: lng });
  };

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {t("settings.language")}
        </CardTitle>
        <CardDescription>{t("settings.languageDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="language">{t("settings.language")}</Label>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language" className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("settings.english")}</SelectItem>
              <SelectItem value="es">{t("settings.spanish")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
