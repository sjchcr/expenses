import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { Salary } from "@/types";
import { Check, Trash2 } from "lucide-react";

interface SalaryInputProps {
  year: number;
  month: number;
  paymentNumber: 1 | 2;
  salary?: Salary;
  onSave: (
    year: number,
    month: number,
    paymentNumber: number,
    amount: number,
  ) => void;
  isSaving: boolean;
}

export function SalaryInput({
  year,
  month,
  paymentNumber,
  salary,
  onSave,
  isSaving,
}: SalaryInputProps) {
  const initialValue =
    typeof salary?.gross_amount === "number" && salary.gross_amount !== 0
      ? salary.gross_amount.toString()
      : "";
  const [localValue, setLocalValue] = useState<string>(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    if (isDirty) {
      const amount = parseFloat(localValue) || 0;
      onSave(year, month, paymentNumber, amount);
      setLocalValue(amount === 0 ? "" : amount.toString());
      setIsDirty(false);
    }
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
  };

  const handleClear = () => {
    if (isSaving) return;

    setLocalValue("");
    setIsDirty(false);
    onSave(year, month, paymentNumber, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleFocus = () => {
    if (!isFocused) {
      setIsFocused(true);
    }
  };

  const displayValue =
    !isFocused && (localValue === "" || Number(localValue) === 0)
      ? ""
      : localValue;
  const hasAmount = localValue !== "" && Number(localValue) !== 0;

  return (
    <div className="relative">
      <InputGroup className="bg-background hover:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:bg-input/30">
        <InputGroupInput
          type="number"
          step="0.01"
          min="0"
          width="100%"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          disabled={isSaving}
          className="hover:bg-transparent"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            title="Copy"
            variant={
              isSaving
                ? "ghost"
                : hasAmount && !isFocused
                ? "ghostDestructive"
                : "ghostSuccess"
            }
            size="iconXs"
            className={!hasAmount ? "hidden" : ""}
            onClick={
              !isSaving ? (hasAmount ? handleClear : handleBlur) : undefined
            }
            disabled={isSaving}
          >
            {isSaving ? (
              <Spinner />
            ) : hasAmount && !isFocused ? (
              <Trash2 />
            ) : (
              <Check />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
