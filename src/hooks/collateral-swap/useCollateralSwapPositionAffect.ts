import { parseUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { PERCENTAGE_PRECISION } from '@helpers/numbers';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';

/**
 * Returns a record where the key is the token address and a bigint is a bigint.
 * The amount that signals the increase or decrease in the token balance
 * after the swap transaction is executed.
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
export function useCollateralSwapPositionAffect() {
  const { data: quoteData } = useCollateralSwapQuote();
  const { data: marketFlashloan } = useMarketFlashLoan();

  const { fromAddress, toAddress } = CollateralSwapContext.use();

  const fromCollateral = useMarketCollateral(fromAddress);
  const baseAsset = useMarketBaseAsset();

  const baseAssetChange: Record<string, bigint> = {};

  if (marketFlashloan && quoteData && baseAsset && fromCollateral) {
    const {
      price: collateralPriceUsd,
      decimals: collateralDecimals
    } = fromCollateral;

    const {
      address: baseAssetAddress,
      price: baseAssetPriceUsd,
      decimals: baseAssetDecimals
    } = baseAsset;

    const fromAmountAsBn = BigInt(quoteData.fromAmount);

    const flashLoanFeeAsBn = parseUnits(`${(marketFlashloan.fee) / 100}`, PERCENTAGE_PRECISION);

    const fromAmountAsBaseAsset = (fromAmountAsBn * collateralPriceUsd * 10n ** BigInt(baseAssetDecimals)) / (baseAssetPriceUsd * 10n ** BigInt(collateralDecimals));

    baseAssetChange[baseAssetAddress] = -(fromAmountAsBaseAsset * flashLoanFeeAsBn / 10n ** BigInt(PERCENTAGE_PRECISION))
  }

  if (quoteData) {
    return {
      [fromAddress]: -BigInt(quoteData.fromAmount),
      [toAddress]: BigInt(quoteData.toAmount),
      ...baseAssetChange
    };
  }
}
