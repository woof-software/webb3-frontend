import { parseUnits } from 'viem';

import MultiplierContext from '@contexts/MultiplierContext';
import { PERCENTAGE_PRECISION } from '@helpers/numbers';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

/**
 * Returns a record where the key is the token address and a bigint is a positive/negative amount of token.
 * The amount - signals the increase or decrease in the token balance after the transaction is executed.
 * 
 * For example:
 * 
 * ```
 * {
 *  ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1']: 1000000000000000000n,
 * }
 * ```
 *
 * That means that the token which has to be multiplied is ARB.
 * And the user protocol balance has to be increased by 1 ARB.
 */
export function useMultiplierEffect() {
  const { data: quoteData } = useMultiplierQuote();
  const { data: marketFlashloan } = useMarketFlashLoan();

  const {
    collateral,
    supply,
  } = MultiplierContext.use();

  const state = useMarketCometState();

  const fromCollateral = useMarketCollateral(collateral);

  if (!state || !collateral || !fromCollateral) {
    return;
  }

  const { baseAsset } = state;

  if (quoteData && marketFlashloan) {
    const fromAmountAsBn = BigInt(quoteData.fromAmount)

    const flashLoan = parseUnits(`${(marketFlashloan.fee) / 100}`, PERCENTAGE_PRECISION);

    const flashLoanEffect = (fromAmountAsBn * flashLoan / 10n ** BigInt(PERCENTAGE_PRECISION));

    return {
      [collateral]: BigInt(quoteData?.toAmount ?? 0n) + parseUnits(supply, fromCollateral.decimals),
      [baseAsset.address]: -(fromAmountAsBn + flashLoanEffect)
    };
  }
}
