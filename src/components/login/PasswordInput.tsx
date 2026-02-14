import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = true,
  children,
}: PasswordInputProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <Label htmlFor={id}>{label}</Label>
      <div className="w-full relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          className="pr-12"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          aria-label={
            showPassword ? t("auth.hidePassword") : t("auth.showPassword")
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {children}
    </div>
  );
}
