import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { PERCENTAGE_PRECISION } from '@helpers/numbers';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useDebounce } from '@hooks/useDebounce';
import { useMarket } from '@hooks/useMarket';
import { useQuoteFrom } from '@hooks/useQuoteFrom';

export function useCollateralRepayQuote() {
  const {
    inputValue,
    slippagePercent,
    fromAddress,
    toAddress,
    platformFee
  } = CollateralSwapContext.use();

  const market = useMarket();

  const swapCollateralAddress = useLeverageContractAddress();
  const client = useQueryClient();

  const fromCollateral = useMarketCollateral(fromAddress);
  const baseAsset = useMarketBaseAsset();

  const { data: marketFlashLoan } = useMarketFlashLoan();

  const {
    price: collateralPriceUsd,
    decimals: fromDecimals = 1
  } = fromCollateral ?? {};

  const {
    price: baseAssetPriceUsd,
    decimals: toDecimals = 1
  } = baseAsset ?? {};

  const {
    fee: flashLoanFee = 0
  } = marketFlashLoan ?? {};

  /**
   * Should cancel any quote request except the latest
   *
   * So, if the user types something within the inputValue field or changes,
   * the previous quote request will be canceled.
   */
  const queries = client.getQueriesData({
    queryKey: ['multiplier', 'quote', 'from']
  });

  (async () => {
    try {
      await client.cancelQueries({
        queryKey: ['multiplier', 'quote', 'from'],
        predicate: (query) => {
          const queryToCancel = queries.at(-1);

          if (!queryToCancel) return false;

          const { queryKey } = query;
          const { 0: latestKey } = queryToCancel;

          return queryKey !== latestKey;
        }
      });
    } catch {
      // do nothing
    }
  })();

  // Centralized quote request triggered on debounced inputs change
  const debounceDelay = 500;
  const debouncedValue = useDebounce(inputValue, debounceDelay);
  const debouncedSlippageValue = useDebounce(slippagePercent, debounceDelay);

  const toAmountAsBN = parseUnits(debouncedValue ?? '0', toDecimals);
  const slippageAsBN = parseUnits(`${(+debouncedSlippageValue + platformFee + flashLoanFee) / 100}`, PERCENTAGE_PRECISION);
  const slippageAsN = parseFloat(debouncedSlippageValue ?? '0');

  let fromAmount = 0n;

  if (toAmountAsBN > 0n) {
    fromAmount = toAmountAsBN * (baseAssetPriceUsd ?? 1n) * (10n ** BigInt(fromDecimals)) / (collateralPriceUsd ?? 1n) / 10n ** BigInt(toDecimals);
    fromAmount += fromAmount * slippageAsBN / 10n ** BigInt(PERCENTAGE_PRECISION);
  }

  const chainId = market?.chainInformation.chainId ?? 1;

  const { data, ...query } = useQuoteFrom({
    amount: fromAmount,
    slippage: slippageAsN,
    chainId: chainId,
    fromTokenAddress: fromAddress,
    toTokenAddress: toAddress,
    userAddress: swapCollateralAddress ?? undefined,
    excludeDexs: marketFlashLoan?.protocol
  });

  return {
    data: (data?.fromToken.toLowerCase() === fromAddress.toLowerCase() && data?.toToken.toLowerCase() === toAddress.toLowerCase()) ? data : undefined,
    ...query
  };
}
