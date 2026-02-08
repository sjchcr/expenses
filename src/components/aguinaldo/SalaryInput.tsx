import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Salary } from "@/types";

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
  const [localValue, setLocalValue] = useState<string>(
    salary?.gross_amount?.toString() || "",
  );
  const [isDirty, setIsDirty] = useState(false);

  const handleBlur = () => {
    if (isDirty) {
      const amount = parseFloat(localValue) || 0;
      onSave(year, month, paymentNumber, amount);
      setIsDirty(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative">
      <InputGroup>
        <InputGroupInput
          type="number"
          step="0.01"
          min="0"
          width="100%"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          disabled={isSaving}
          className="hover:bg-transparent"
        />
        <InputGroupAddon align="inline-end">
          <Spinner className={cn(!isSaving && "hidden")} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
