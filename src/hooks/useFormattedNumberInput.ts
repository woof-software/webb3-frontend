import {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
  useEffect,
  useRef,
} from 'react';

type useFormattedNumberInputArgs = {
  value: string;
  inputRef: RefObject<HTMLInputElement | null>;
};

/**
 * Provides formatting and cursor management for a controlled numeric input with
 * thousands separators.
 *
 * Features:
 * - Formats the integer part of the value with comma thousand separators.
 * - Preserves the cursor position after React re-renders the controlled input.
 * - Prevents deleting thousand separators with `Backspace` and `Delete`; instead,
 *   the cursor moves across the separator while leaving it intact.
 *
 * @param value - Raw numeric value without a thousand separators.
 * @param inputRef - Ref to the underlying input element.
 *
 * @returns An object containing:
 * - `formattedValue` - The formatted value to render in the input.
 * - `onKeyDown` - Keyboard handler that skips over thousand separators on deletion.
 * - `rememberCursor` - Change handler helper that stores the logical cursor position
 *   before the parent updates the controlled value. Call this at the beginning of
 *   your input's `onChange` handler.
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 *
 * const {
 *   formattedValue,
 *   onKeyDown,
 *   rememberCursor,
 * } = useFormattedNumberInput({
 *   value,
 *   inputRef,
 * });
 *
 * const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
 *   rememberCursor(e);
 *   onChange(e.target.value.replace(/,/g, ''));
 * };
 *
 * <input
 *   ref={inputRef}
 *   value={formattedValue}
 *   onKeyDown={onKeyDown}
 *   onChange={handleChange}
 * />
 * ```
 */

export const useFormattedNumberInput = ({ value, inputRef }: useFormattedNumberInputArgs) => {
  const cursorDigitsRef = useRef<number | null>(null);

  const formatWithThousandSeparators = (value: string): string => {
    if (!value) return value;

    const [integerPart, decimalPart] = value.split('.');

    const formattedIntegerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    );

    return decimalPart !== undefined
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursor = input.selectionStart ?? 0;

    if (input.selectionStart !== input.selectionEnd) {
      return;
    }

    if (e.key === 'Backspace') {
      if (cursor > 0 && input.value[cursor - 1] === ',') {
        e.preventDefault();
        input.setSelectionRange(cursor - 1, cursor - 1);
      }
    }

    if (e.key === 'Delete') {
      if (input.value[cursor] === ',') {
        e.preventDefault();
        input.setSelectionRange(cursor + 1, cursor + 1);
      }
    }
  };

  const rememberCursor = (e: ChangeEvent<HTMLInputElement>) => {
    const cursor = e.target.selectionStart ?? 0;

    cursorDigitsRef.current = (
      e.target.value
        .slice(0, cursor)
        .match(/\d/g) ?? []
    ).length;
  };

  const formattedValue = formatWithThousandSeparators(value);

  useEffect(() => {
    const input = inputRef.current;

    if (!input || cursorDigitsRef.current === null) {
      return;
    }

    requestAnimationFrame(() => {
      let digits = 0;
      let cursorPos = 0;

      while (
        cursorPos < input.value.length &&
        digits < cursorDigitsRef.current!
        ) {
        if (/\d/.test(input.value[cursorPos])) {
          digits++;
        }

        cursorPos++;
      }

      input.setSelectionRange(cursorPos, cursorPos);
    });
  }, [formattedValue, inputRef]);

  return {
    formattedValue,
    onKeyDown,
    rememberCursor,
  };
};