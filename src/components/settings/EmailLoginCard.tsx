import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import {
  PasswordChecklist,
  PasswordInput,
  PASSWORD_RULE,
  getPasswordChecks,
} from "@/components/login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface EmailLoginCardProps {
  user: SupabaseUser | null;
}

export function EmailLoginCard({ user }: EmailLoginCardProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email || "";
  const isAppleUser = Boolean(
    user?.identities?.some((identity) => identity.provider === "apple"),
  );
  const passwordChecks = getPasswordChecks(password);
  const hasMismatch = Boolean(confirmPassword && password !== confirmPassword);

  if (!user || !email || !isAppleUser) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!PASSWORD_RULE.test(password)) {
      setError(t("auth.passwordRequirements"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await authService.updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      toast.success(t("settings.emailLoginPasswordUpdated"));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("settings.emailLoginUpdateFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-linear-to-b from-background to-accent border border-gray-200 dark:border-gray-900 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          {t("settings.emailLogin")}
        </CardTitle>
        <CardDescription>{t("settings.emailLoginDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-lg border bg-background/70 p-3">
            <Label className="text-xs text-muted-foreground">
              {t("auth.email")}
            </Label>
            <p className="mt-1 break-all text-sm font-medium">{email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("settings.emailLoginApplePrivateEmailNote")}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <PasswordInput
            id="emailLoginPassword"
            label={t("auth.newPassword")}
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
          >
            <PasswordChecklist checks={passwordChecks} />
          </PasswordInput>

          <PasswordInput
            id="emailLoginConfirmPassword"
            label={t("auth.confirmPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            autoComplete="new-password"
          >
            {hasMismatch && (
              <p className="flex items-center gap-2 pl-3 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                {t("auth.passwordsDoNotMatch")}
              </p>
            )}
            {confirmPassword && !hasMismatch && (
              <p className="flex items-center gap-2 pl-3 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("auth.passwordsMatch")}
              </p>
            )}
          </PasswordInput>

          <Button
            type="submit"
            disabled={isSaving || !password || !confirmPassword}
            className="w-full sm:w-auto"
          >
            {isSaving ? t("common.saving") : t("settings.createEmailPassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
