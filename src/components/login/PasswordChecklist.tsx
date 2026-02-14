import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PasswordChecks } from "./types";

interface PasswordChecklistProps {
  checks: PasswordChecks;
}

export function PasswordChecklist({ checks }: PasswordChecklistProps) {
  const { t } = useTranslation();

  const rules = [
    { key: "length" as const, label: t("auth.passwordRuleLength") },
    { key: "uppercase" as const, label: t("auth.passwordRuleUppercase") },
    { key: "lowercase" as const, label: t("auth.passwordRuleLowercase") },
    { key: "digit" as const, label: t("auth.passwordRuleDigit") },
    { key: "symbol" as const, label: t("auth.passwordRuleSymbol") },
  ];

  return (
    <ul className="text-xs space-y-1 text-muted-foreground w-full pl-3">
      {rules.map(({ key, label }) => {
        const passed = checks[key];
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
  );
}
