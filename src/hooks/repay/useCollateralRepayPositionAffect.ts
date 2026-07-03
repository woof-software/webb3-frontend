import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

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
export function useCollateralRepayPositionAffect() {
  const { data: quoteData } = useCollateralRepayQuote();

  const { fromAddress } = CollateralSwapContext.use();

  const state = useMarketCometState();

  const fromCollateral = useMarketCollateral(fromAddress);

  if (!state || !fromCollateral) {
    return;
  }

  const { baseAsset } = state;

  if (quoteData) {
    return {
      [fromAddress]: -BigInt(quoteData?.fromAmount ?? 0n),
      [baseAsset.address]: BigInt(quoteData?.toAmount ?? 0n)
    };
  }
}
