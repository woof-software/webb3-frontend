/**
 * Generates a regular expression to validate floating-point numbers with specified integer
 * and decimal part lengths. The resulting regex allows numbers that adhere to the given
 * constraints for integer and decimal portions.
 *
 * @example
 * const regex = spawnFloatRegex(2, 2); // returns pattern which can be used to validation of the user input
 *
 * // regex.test | regex.exec ...
 * // "2.22" -> true
 * // "2.222" -> false
 * // "2.2" -> true
 * // "2" -> true
 * // "222" -> false
 *
 * @param integerPartLength - The maximum allowed length of the integer part of the number.
 * @param decimalPartLength - The maximum allowed length of the decimal part of the number.
 * @returns A regular expression to validate floating-point numbers according to the specified rules.
 */
export function spawnFloatRegex(integerPartLength: number, decimalPartLength: number): RegExp {
  return new RegExp(`^(0((\\.)([0-9]{0,${decimalPartLength}})|))|([0-9]{1,${integerPartLength}}|([0-9]{1,${integerPartLength}}(\\.)([0-9]{0,${decimalPartLength}})|))$`);
}
