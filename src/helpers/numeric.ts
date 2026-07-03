/**
 * Finds the maximum value among the provided numbers or bigints.
 * All arguments must be of the same type (either all numbers or all bigints).
 *
 * @param n - Variable number of arguments of the same type
 * @returns The maximum value with the same type as inputs
 * @throws Error if no arguments are provided
 *
 * @example
 * max(1, 5, 3); // 5
 * max(-2, -8, -1); // -1
 * max(10n, 5n, 20n); // 20n
 * max(); // throws Error: "No numbers provided"
 */
export function max<T extends number | bigint>(...n: T[]): T {
  if (n.length === 0) {
    throw new Error('No numbers provided');
  }

  let max = n[0];

  for (const num of n) {
    if (num > max) {
      max = num;
    }
  }

  return max;
}

/**
 * Finds the minimum value among the provided numbers or bigints.
 * All arguments must be of the same type (either all numbers or all bigints).
 *
 * @param n - Variable number of arguments of the same type
 * @returns The maximum value with the same type as inputs
 * @throws Error if no arguments are provided
 *
 * @example
 * max(1, 5, 3); // 5
 * max(-2, -8, -1); // -1
 * max(10n, 5n, 20n); // 20n
 * max(); // throws Error: "No numbers provided"
 *
 */
export function min<T extends number | bigint>(...n: T[]): T {
  if (n.length === 0) {
    throw new Error('No numbers provided');
  }

  let min = n[0];

  for (const num of n) {
    if (num < min) {
      min = num;
    }
  }

  return min;
}

/**
 * Clamps a numeric value between the given minimum and maximum bounds.
 *
 * - If `value < min`, returns `min`.
 * - If `value > max`, returns `max`.
 * - Otherwise, returns `value`.
 *
 * Supports both `number` and `bigint`.
 *
 * @param value - The value to clamp.
 * @param min - The minimum bound.
 * @param max - The maximum bound.
 * @returns The clamped value, guaranteed to be between `min` and `max`.
 *
 * @example
 * clamp(10, 0, 5); // 5
 * clamp(-3, 0, 10); // 0
 * clamp(7, 0, 10); // 7
 *
 * @example
 * clamp(15n, 5n, 10n); // 10n
 * clamp(3n, 5n, 10n); // 5n
 */
export function clamp(value: number, min: number, max: number): number;
export function clamp(value: bigint, min: bigint, max: bigint): bigint;
export function clamp(
  value: number | bigint,
  _min: number | bigint,
  _max: number | bigint
): number | bigint {
  return min(max(value, _min), _max);
}

/**
 * Calculates the absolute value of the given number. Unlike the `Math.abs`, this util may work with both `number` and
 * `bigint` types. Depends on the type of the passed value and keeps type-safety.
 *
 * @example
 * abs(-10); // 10 (number for TS)
 * abs(10n); // 10n (bigint for TS)
 *
 * @param value The number for which to calculate the absolute value.
 * @return The absolute value of the given number.
 */
export function abs(value: number): number;
export function abs(value: bigint): bigint;
export function abs(value: number | bigint): number | bigint {
  return value < 0 ? -value : value;
}
