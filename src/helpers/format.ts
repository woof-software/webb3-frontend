export type FormatView = 'standard' | 'compact';

/**
 * Formats a number as a token amount with a symbol.
 * @example
 * e.g., token(12345, tokenSymbol: 'ETH', view: 'compact' ) -> '12.35K ETH'
 * e.g., token(123.45678, tokenSymbol: 'ETH', view: 'full', decimals: 4 ) -> '123.4568 ETH'
 */
export function formatToken(
  value: number | string,
  view?: FormatView,
  tokenSymbol?: string
) {
  let numberValue = Number(value);
  const options: Intl.NumberFormatOptions = {};
  const locale = 'en-US';

  if (isNaN(numberValue) || !isFinite(numberValue)) {
    console.warn('Value is not');
    numberValue = 0;
  }

  if (numberValue < 0.0001 && numberValue > 0) {
    return tokenSymbol ? `< 0.0001 ${tokenSymbol}` : `< 0.0001`;
  }

  options.notation = view;
  options.maximumFractionDigits = 4;
  options.minimumFractionDigits = 4;
  options.style = 'decimal';

  const formattedNumber = new Intl.NumberFormat(locale, options).format(
    numberValue
  );
  return tokenSymbol ? `${formattedNumber} ${tokenSymbol}` : formattedNumber;
}
