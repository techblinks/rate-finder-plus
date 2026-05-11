import { useEffect, useRef, useState } from "react";

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

interface CurrencyInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Currency input that displays `$650,000` while typing and stores a raw number
 * in parent state. Cursor position is preserved across the reformat by
 * counting digits to the left of the caret.
 *
 * inputmode="numeric" pattern="[0-9]*" — Sprint 1 invariant.
 */
export const CurrencyInput = ({
  value,
  onChange,
  min,
  max,
  ariaLabel,
  placeholder,
  className,
  id,
}: CurrencyInputProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState<string>(() =>
    Number.isFinite(value) && value > 0 ? AUD0.format(value) : "",
  );
  const nextCaretRef = useRef<number | null>(null);

  // Keep display in sync when parent updates value externally.
  useEffect(() => {
    if (document.activeElement === ref.current) return;
    setDisplay(Number.isFinite(value) && value > 0 ? AUD0.format(value) : "");
  }, [value]);

  // Restore caret after formatted re-render.
  useEffect(() => {
    if (nextCaretRef.current == null || !ref.current) return;
    const pos = nextCaretRef.current;
    try {
      ref.current.setSelectionRange(pos, pos);
    } catch {
      /* no-op */
    }
    nextCaretRef.current = null;
  }, [display]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value;
    const caretBefore = el.selectionStart ?? raw.length;

    // Count digits to the left of caret in the raw input.
    const digitsLeft = raw.slice(0, caretBefore).replace(/\D/g, "").length;

    // Strip to digits only, parse number.
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly === "") {
      setDisplay("");
      onChange(0);
      return;
    }
    let n = parseInt(digitsOnly, 10);
    if (!Number.isFinite(n)) n = 0;
    if (typeof min === "number" && n < min) n = min;
    if (typeof max === "number" && n > max) n = max;

    const formatted = AUD0.format(n);

    // Find caret position in formatted string that lands after `digitsLeft` digits.
    let seen = 0;
    let newPos = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen += 1;
        if (seen === digitsLeft) {
          newPos = i + 1;
          break;
        }
      }
    }
    if (digitsLeft === 0) newPos = formatted.search(/\d/);

    nextCaretRef.current = newPos;
    setDisplay(formatted);
    onChange(n);
  };

  return (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onBlur={() => {
        setDisplay(value > 0 ? AUD0.format(value) : "");
      }}
      className={className ?? "field-input tnum w-full"}
    />
  );
};

export default CurrencyInput;
