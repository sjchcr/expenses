import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth.service";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import {
  LoginHeader,
  OAuthButtons,
  EmailAuthContent,
  PASSWORD_RULE,
  getPasswordChecks,
  type AuthMode,
} from "@/components/login";

export default function Login() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const passwordChecks = getPasswordChecks(password);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (authMode === "signup" && !PASSWORD_RULE.test(password)) {
        setError(t("auth.passwordRequirements"));
        setLoading(false);
        return;
      }
      setError(null);
      if (authMode === "signup") {
        const result = await authService.signUpWithEmail(email, password, {
          firstName,
          lastName,
        });
        setEmailDrawerOpen(false);
        if (result.user && !result.session) {
          toast.success(t("auth.signUpSuccess"), {
            description: t("auth.checkEmailConfirmation"),
          });
        }
      } else {
        await authService.signInWithEmail(email, password);
        setEmailDrawerOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t("auth.emailRequired"));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
      setEmailDrawerOpen(false);
      toast.success(t("auth.resetEmailSent"), {
        description: t("auth.checkEmailReset"),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openEmailDrawer = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setEmailDrawerOpen(true);
  };

  const changeAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
  };

  const isCancellationError = (err: unknown): boolean => {
    const message = (err as { message?: string })?.message?.toLowerCase() || "";
    return (
      message.includes("cancel") ||
      message.includes("cancelled") ||
      message.includes("1001") ||
      message.includes("user denied") ||
      message.includes("popup closed")
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      if (!isCancellationError(err)) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithApple();
    } catch (err: unknown) {
      if (!isCancellationError(err)) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <Card className="w-full min-h-dvh sm:h-fit flex flex-col items-center justify-center gap-10 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-4 max-w-md pb-4 rounded-none sm:rounded-2xl bg-transparent border-0 shadow-none">
        <LoginHeader />
        <CardContent className="w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          <OAuthButtons
            loading={loading}
            onGoogleSignIn={handleGoogleSignIn}
            onAppleSignIn={handleAppleSignIn}
            onEmailSignIn={() => openEmailDrawer("signin")}
          />
        </CardContent>
      </Card>

      <Dialog open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen}>
        <DialogContent
          className="bg-background/90 backdrop-blur-lg p-4 max-w-md gap-0"
          backButton={authMode != "signin"}
        >
          <EmailAuthContent
            Header={DialogHeader}
            Title={DialogTitle}
            Description={DialogDescription}
            Footer={DialogFooter}
            mode={authMode}
            onChangeMode={changeAuthMode}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword((prev) => !prev)}
            passwordChecks={passwordChecks}
            error={error}
            loading={loading}
            onSubmit={handleEmailAuth}
            onForgotPassword={handleForgotPassword}
            buttonClassName="w-full"
          />
        </DialogContent>
      </Dialog>

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
