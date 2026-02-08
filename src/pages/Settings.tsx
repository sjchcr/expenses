import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Coins,
  Calendar,
  Download,
  User,
  Plus,
  Trash2,
  Languages,
} from "lucide-react";
import { useUserSettings, useUpdateSettings } from "@/hooks/useUserSettings";
import i18n, { changeLanguage } from "@/lib/i18n";
import { useExpenses } from "@/hooks/useExpenses";
import { useTemplates } from "@/hooks/useTemplates";
import { authService } from "@/services/auth.service";
import { AvatarUpload } from "@/components/common/AvatarUpload";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentPeriod } from "@/types";
import { useMobile } from "@/hooks/useMobile";
import CustomHeader from "@/components/common/CustomHeader";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const COMMON_CURRENCIES = [
  "USD",
  "CRC",
  "COP",
  "MXN",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
];

export default function Settings() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { settings, isLoading, refetch: refetchSettings } = useUserSettings();
  const updateMutation = useUpdateSettings();
  const { data: expenses, refetch: refetchExpenses } = useExpenses({});
  const { data: templates, refetch: refetchTemplates } = useTemplates();

  // Primary currency state
  const [primaryCurrency, setPrimaryCurrency] = useState("USD");

  // Payment periods state
  const [paymentPeriods, setPaymentPeriods] = useState<PaymentPeriod[]>([
    { period: 1, start_day: 1, end_day: 15 },
    { period: 2, start_day: 16, end_day: 31 },
  ]);

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  const {
    user,
    isLoading: isUserLoading,
    refresh: refreshUser,
  } = useCurrentUser();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load settings into state
  useEffect(() => {
    if (settings) {
      setPrimaryCurrency(settings.primary_currency);
      setPaymentPeriods(settings.payment_periods);
      // Sync language from database if different from current
      if (settings.language && settings.language !== i18n.language) {
        changeLanguage(settings.language);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    setUserEmail(user.email || null);
    const fName = (user.user_metadata?.first_name as string) || "";
    const lName = (user.user_metadata?.last_name as string) || "";
    if (!fName && !lName && user.user_metadata?.full_name) {
      const parts = String(user.user_metadata.full_name).split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setOriginalFirstName(parts[0] || "");
      setOriginalLastName(parts.slice(1).join(" ") || "");
    } else {
      setFirstName(fName);
      setLastName(lName);
      setOriginalFirstName(fName);
      setOriginalLastName(lName);
    }
  }, [user]);

  const handleSavePrimaryCurrency = async () => {
    try {
      await updateMutation.mutateAsync({ primary_currency: primaryCurrency });
      toast.success("Primary currency updated");
    } catch (error) {
      toast.error("Failed to update primary currency");
    }
  };

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
      // Renumber periods
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
    // Validate periods don't overlap and cover all days
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
    } catch (error) {
      toast.error("Failed to update payment periods");
    }
  };

  const handleExport = () => {
    if (!expenses || expenses.length === 0) {
      toast.error(t("settings.noExpensesToExport"));
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (exportFormat === "csv") {
      // Create CSV
      const headers = [
        "Name",
        "Due Date",
        "Is Paid",
        "Payment Period",
        "Currencies",
        "Amounts",
        "Created At",
      ];
      const rows = expenses.map((e) => [
        e.name,
        e.due_date,
        e.is_paid ? "Yes" : "No",
        e.payment_period,
        e.amounts.map((a) => a.currency).join("; "),
        e.amounts.map((a) => `${a.currency}: ${a.amount}`).join("; "),
        e.created_at || "",
      ]);

      content = [
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
      ].join("\n");
      filename = `expenses-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      mimeType = "text/csv";
    } else {
      // Create JSON
      const exportData = {
        exportDate: new Date().toISOString(),
        settings: settings,
        expenses: expenses,
        templates: templates || [],
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `expenses-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      mimeType = "application/json";
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(
      t("settings.exported", {
        count: expenses.length,
        format: exportFormat.toUpperCase(),
      }),
    );
    setIsExportDialogOpen(false);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setOriginalFirstName(firstName.trim());
      setOriginalLastName(lastName.trim());
      await refreshUser();
      toast.success(t("settings.profileUpdated"));
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const hasProfileChanges =
    firstName.trim() !== originalFirstName ||
    lastName.trim() !== originalLastName;

  if (isLoading || isUserLoading) {
    return (
      <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
        <div className="px-4 sm:px-0 flex flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    await Promise.all([
      refetchSettings(),
      refetchExpenses(),
      refetchTemplates(),
      refreshUser(),
    ]);
  };

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col justify-start items-start gap-1">
          {!isMobile && (
            <h2 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              {t("settings.title")}
            </h2>
          )}
          <div className="text-sm text-gray-600">
            {t("settings.description")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("settings.account")}
            </CardTitle>
            <CardDescription>{t("settings.accountDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AvatarUpload user={user} onAvatarChange={() => refreshUser()} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            {userEmail && (
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="font-medium text-sm">{userEmail}</p>
              </div>
            )}
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile || !hasProfileChanges}
            >
              {isSavingProfile ? t("common.saving") : t("settings.saveProfile")}
            </Button>
          </CardContent>
        </Card>

        {/* Payment Periods */}
        <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("settings.paymentPeriods")}
            </CardTitle>
            <CardDescription>
              {t("settings.paymentPeriodsDesc")}
            </CardDescription>
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
                        handlePeriodChange(
                          index,
                          "start_day",
                          parseInt(value) || 1,
                        )
                      }
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a fruit" />
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
                        handlePeriodChange(
                          index,
                          "end_day",
                          parseInt(value) || 31,
                        )
                      }
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a fruit" />
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
              <Button type="button" variant="ghost" onClick={handleAddPeriod}>
                <Plus className="h-3 w-3" />
                {t("settings.addPeriod")}
              </Button>
              <Button
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

        {/* Primary Currency */}
        <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {t("settings.primaryCurrency")}
            </CardTitle>
            <CardDescription>
              {t("settings.primaryCurrencyDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary-currency">{t("common.currency")}</Label>
              <Select
                value={primaryCurrency}
                onValueChange={setPrimaryCurrency}
              >
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
              onClick={handleSavePrimaryCurrency}
              disabled={
                updateMutation.isPending ||
                primaryCurrency === settings?.primary_currency
              }
            >
              {updateMutation.isPending
                ? t("common.saving")
                : t("settings.saveCurrency")}
            </Button>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t("settings.exportData")}
            </CardTitle>
            <CardDescription>{t("settings.exportDataDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>{t("settings.yourDataIncludes")}</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  {t("settings.expensesCount", {
                    count: expenses?.length || 0,
                  })}
                </li>
                <li>
                  {t("settings.templatesCount", {
                    count: templates?.length || 0,
                  })}
                </li>
                <li>{t("settings.yourSettings")}</li>
              </ul>
            </div>
            <Button onClick={() => setIsExportDialogOpen(true)}>
              <Download className="h-4 w-4" />
              {t("settings.exportData")}
            </Button>
          </CardContent>
        </Card>

        {/* Language */}
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
              <Select
                value={i18n.language}
                onValueChange={async (lng) => {
                  await changeLanguage(lng);
                  // Save to database
                  updateMutation.mutate({ language: lng });
                }}
              >
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
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && <CustomHeader title={t("settings.title")} />}
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>{content}</PullToRefresh>
      ) : (
        content
      )}

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settings.exportData")}</DialogTitle>
            <DialogDescription>
              {t("settings.exportDataDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("settings.exportFormat")}</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as "csv" | "json")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">{t("settings.csvFormat")}</SelectItem>
                  <SelectItem value="json">
                    {t("settings.jsonFormat")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {exportFormat === "csv"
                  ? t("settings.csvHint")
                  : t("settings.jsonHint")}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4" />
                {t("settings.download")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
