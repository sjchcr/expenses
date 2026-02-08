import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/useTheme";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  symbol: boolean;
};

export default function ResetPassword() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const passwordChecks: PasswordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  useEffect(() => {
    // Check if we have a valid session from the reset password link
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setHasSession(!!session);
      } catch {
        setHasSession(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

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

  if (checking) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-linear-to-b from-primary to-primary/70 dark:to-accent">
        <Spinner className="size-12 text-primary-foreground" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
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
            <CardTitle className="text-xl">{t("auth.linkExpired")}</CardTitle>
            <CardDescription>{t("auth.linkExpiredDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <Button onClick={() => navigate("/login")} className="w-full">
              {t("auth.backToSignIn")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
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
          <CardTitle className="text-xl">
            {t("auth.resetYourPassword")}
          </CardTitle>
          <CardDescription>{t("auth.resetYourPasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-start gap-2 w-full">
              <Label htmlFor="password">{t("auth.newPassword")}</Label>
              <div className="w-full relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground w-full pl-3">
                {[
                  { key: "length", label: t("auth.passwordRuleLength") },
                  { key: "uppercase", label: t("auth.passwordRuleUppercase") },
                  { key: "lowercase", label: t("auth.passwordRuleLowercase") },
                  { key: "digit", label: t("auth.passwordRuleDigit") },
                  { key: "symbol", label: t("auth.passwordRuleSymbol") },
                ].map(({ key, label }) => {
                  const passed = passwordChecks[key as keyof PasswordChecks];
                  const Icon = passed ? CheckCircle2 : XCircle;
                  return (
                    <li
                      key={key}
                      className={`flex items-center gap-2 ${
                        passed ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-2 w-full">
              <Label htmlFor="confirmPassword">
                {t("auth.confirmPassword")}
              </Label>
              <div className="w-full relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
            </div>

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

      <Toaster
        richColors
        theme={resolvedTheme as "light" | "dark"}
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg",
            title: "text-card-foreground font-semibold",
            description: "text-muted-foreground",
            success:
              "!bg-green-500/20 dark:!bg-green-400/20 !border-green-500/20 dark:!border-green-400/30",
          },
        }}
      />
    </div>
  );
}
