import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import {
  PASSWORD_RULE,
  getPasswordChecks,
  type AuthMode,
} from "@/components/login";

export function useAuthDialog() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const passwordChecks = getPasswordChecks(password);

  const resetForm = () => {
    setError(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const openAuthDialog = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
    setOpen(true);
  };

  const changeAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (authMode === "signup" && !PASSWORD_RULE.test(password)) {
        setError(t("auth.passwordRequirements"));
        return;
      }
      setError(null);
      if (authMode === "signup") {
        const result = await authService.signUpWithEmail(email, password, {
          firstName,
          lastName,
        });
        setOpen(false);
        if (result.user && !result.session) {
          toast.success(t("auth.signUpSuccess"), {
            description: t("auth.checkEmailConfirmation"),
          });
        }
      } else {
        await authService.signInWithEmail(email, password);
        setOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setError(t("auth.emailRequired"));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
      setOpen(false);
      toast.success(t("auth.resetEmailSent"), {
        description: t("auth.checkEmailReset"),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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

  return {
    open,
    setOpen,
    authMode,
    changeAuthMode,
    openAuthDialog,
    loading,
    error,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    passwordChecks,
    handleEmailAuth,
    handleForgotPassword,
    handleGoogleSignIn,
    handleAppleSignIn,
  };
}

export type AuthDialogController = ReturnType<typeof useAuthDialog>;
