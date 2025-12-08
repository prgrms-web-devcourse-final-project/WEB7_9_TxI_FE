import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  className = "",
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <div className="relative inline-flex">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <div
        className={`h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {checked && (
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
