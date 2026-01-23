import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Coins,
  Calendar,
  Download,
  User,
  Plus,
  Trash2,
  LogOut,
} from "lucide-react";
import { useUserSettings, useUpdateSettings } from "@/hooks/useUserSettings";
import { useExpenses } from "@/hooks/useExpenses";
import { useTemplates } from "@/hooks/useTemplates";
import { authService } from "@/services/auth.service";
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
import { Separator } from "@/components/ui/separator";
import type { PaymentPeriod } from "@/types";

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
  const { settings, isLoading } = useUserSettings();
  const updateMutation = useUpdateSettings();
  const { data: expenses } = useExpenses({});
  const { data: templates } = useTemplates();

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

  // User info
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
    }
  }, [settings]);

  // Load user info
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) {
        setUserEmail(user.email || null);
        const fName = user.user_metadata?.first_name || "";
        const lName = user.user_metadata?.last_name || "";
        // If no first/last name, try to split full_name
        if (!fName && !lName && user.user_metadata?.full_name) {
          const parts = user.user_metadata.full_name.split(" ");
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
      }
    });
  }, []);

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
        toast.error(
          `Period ${period.period}: Start day must be before end day`,
        );
        return;
      }
      if (i > 0) {
        const prevPeriod = sortedPeriods[i - 1];
        if (period.start_day <= prevPeriod.end_day) {
          toast.error("Payment periods cannot overlap");
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
      toast.error("No expenses to export");
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
      filename = `expenses-export-${new Date().toISOString().split("T")[0]}.csv`;
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
      filename = `expenses-export-${new Date().toISOString().split("T")[0]}.json`;
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
      `Exported ${expenses.length} expenses as ${exportFormat.toUpperCase()}`,
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
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const hasProfileChanges =
    firstName.trim() !== originalFirstName ||
    lastName.trim() !== originalLastName;

  const handleSignOut = async () => {
    await authService.signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="w-full mx-auto py-6 md:px-[calc(100%/12)] sm:px-6">
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

  return (
    <div className="w-full mx-auto py-6 md:px-[calc(100%/12)] sm:px-6">
      <div className="px-4 sm:px-0 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              Settings
            </h2>
            <div className="text-sm text-gray-600">
              Manage your account preferences and application settings.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Primary currency
              </CardTitle>
              <CardDescription>
                Your default currency for displaying totals and conversions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-currency">Currency</Label>
                <Select
                  value={primaryCurrency}
                  onValueChange={setPrimaryCurrency}
                >
                  <SelectTrigger id="primary-currency" className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60">
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
                {updateMutation.isPending ? "Saving..." : "Save currency"}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Periods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Payment periods
              </CardTitle>
              <CardDescription>
                Customize how expenses are grouped by payment period.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {paymentPeriods.map((period, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm font-medium w-20">
                      Period {period.period}
                    </span>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">Day</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={period.start_day}
                        onChange={(e) =>
                          handlePeriodChange(
                            index,
                            "start_day",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={period.end_day}
                        onChange={(e) =>
                          handlePeriodChange(
                            index,
                            "end_day",
                            parseInt(e.target.value) || 31,
                          )
                        }
                        className="w-16 h-8"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePeriod(index)}
                      disabled={paymentPeriods.length === 1}
                      className="h-8 w-8 p-0 ml-auto"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPeriod}
                >
                  <Plus className="h-3 w-3" />
                  Add period
                </Button>
                <Button
                  onClick={handleSavePaymentPeriods}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save periods"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </CardTitle>
              <CardDescription>
                Your account information and profile settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="mt-1"
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
                {isSavingProfile ? "Saving..." : "Save profile"}
              </Button>
              <Separator />
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export data
              </CardTitle>
              <CardDescription>
                Download your expenses and settings as CSV or JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Your data includes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>{expenses?.length || 0} expenses</li>
                  <li>{templates?.length || 0} templates</li>
                  <li>Your settings and preferences</li>
                </ul>
              </div>
              <Button onClick={() => setIsExportDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose a format for your data export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as "csv" | "json")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    CSV (Spreadsheet compatible)
                  </SelectItem>
                  <SelectItem value="json">JSON (Full data backup)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {exportFormat === "csv"
                  ? "Best for importing into Excel or Google Sheets."
                  : "Includes all data including templates and settings."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
