import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

export type UseCustomLtvArgs = {
  changes?: Record<string, bigint>;
}

/**
 * Returns current used debt if it exists. Otherwise, 0 will be returned.
 * 
 * Pass an object with predefined changes to see how it affects the user position.
 * The object has to contain a base asset address as a key to affect the debt amount.
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
