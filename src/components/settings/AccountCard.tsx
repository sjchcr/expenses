import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountCardProps {
  user: SupabaseUser | null;
  onProfileUpdate: () => void;
}

export function AccountCard({ user, onProfileUpdate }: AccountCardProps) {
  const { t } = useTranslation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setOriginalFirstName(firstName.trim());
      setOriginalLastName(lastName.trim());
      onProfileUpdate();
      toast.success(t("settings.profileUpdated"));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const hasProfileChanges =
    firstName.trim() !== originalFirstName ||
    lastName.trim() !== originalLastName;

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {t("settings.account")}
        </CardTitle>
        <CardDescription>{t("settings.accountDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AvatarUpload user={user} onAvatarChange={onProfileUpdate} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <p className="font-medium text-sm pl-3">{userEmail}</p>
          </div>
        )}
        <Button
          onClick={handleSaveProfile}
          disabled={isSavingProfile || !hasProfileChanges}
          className="w-full sm:w-auto"
        >
          {isSavingProfile ? t("common.saving") : t("settings.saveProfile")}
        </Button>
      </CardContent>
    </Card>
  );
}
