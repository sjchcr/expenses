import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { PasswordInput } from "./PasswordInput";
import { PasswordChecklist } from "./PasswordChecklist";
import { PASSWORD_RULE, getPasswordChecks } from "./types";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = getPasswordChecks(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!PASSWORD_RULE.test(password)) {
      setError(t("auth.passwordRequirements"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.updatePassword(password);
      toast.success(t("auth.passwordUpdated"));
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full min-h-dvh sm:min-h-0 sm:h-fit flex flex-col items-center justify-center gap-6 pt-[calc(1rem+env(safe-area-inset-top))] max-w-md rounded-none sm:rounded-2xl bg-background/90 backdrop-blur-lg">
      <CardHeader className="w-full">
        <img
          src={
            resolvedTheme === "dark"
              ? "/icon-1024x1024-dark.png"
              : "/icon-1024x1024.png"
          }
          alt={siteTitle}
          className="h-16 w-16"
        />
        <CardTitle className="text-xl">{t("auth.resetYourPassword")}</CardTitle>
        <CardDescription>{t("auth.resetYourPasswordDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <PasswordInput
            id="password"
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
            id="confirmPassword"
            label={t("auth.confirmPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            autoComplete="new-password"
          >
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-2 pl-3">
                <XCircle className="h-3.5 w-3.5" />
                {t("auth.passwordsDoNotMatch")}
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-emerald-600 flex items-center gap-2 pl-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("auth.passwordsMatch")}
              </p>
            )}
          </PasswordInput>

          <Button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full mt-2"
          >
            {loading ? t("common.loading") : t("auth.updatePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
