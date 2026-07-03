import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

export type UseCustomLtvArgs = {
  changes?: Record<string, bigint>;
}

/**
 * Returns a record where the key is the token address and a bigint is a bigint.
 * The amount that signals the increase or decrease in the token balance
 * after the redemption transaction is executed.
 *
 * For example,
 * ```
 * {
 *  ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1']: -1000000000000000000n,
 * }
 * ```
 *
 * That means that the source of the Repay transaction is an ARB token, and
 * the parsed value filled in by the user is equal to 1000000000000000000n (1 ARB).
 */
export function useUserDebt(args?: UseCustomLtvArgs) {
  const {
    changes = {}
  } = args ?? {};

  const state = useMarketCometState();

  if (!state) {
    return 0n;
  }

  const { baseAsset } = state;

  let loan = (baseAsset?.balance ?? 0n);

  loan += changes[baseAsset.address] ?? 0n;

  if (loan >= 0n) {
    loan = 0n;
  }

  if (loan < 0n) {
    loan *= -1n;
  }

  return (loan * baseAsset.price) / 10n ** BigInt(baseAsset.decimals);
}
