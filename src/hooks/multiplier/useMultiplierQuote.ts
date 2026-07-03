import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';

import MultiplierContext from '@contexts/MultiplierContext';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useDebounce } from '@hooks/useDebounce';
import { useMarket } from '@hooks/useMarket';
import { useQuoteFrom } from '@hooks/useQuoteFrom'

/**
 * One more way to extract the current multiplier swap quote.
 * This mechanism is separate from the Multiplier Context and
 * doesn't require direct linking between the quote fetcher and
 * the multiplier context itself.
 */
export function useMultiplierQuote() {
  const {
    supply,
    multiplierValue,
    slippagePercent,
    collateral,
  } = MultiplierContext.use();

  const market = useMarket();
  
  const multiplierAddress = useLeverageContractAddress();

  const { data: marketFlashLoan } = useMarketFlashLoan();

  const {
    decimals: collateralDecimals = 1,
    address: toTokenAddress,
    price: collateralPriceUsd,
  } = useMarketCollateral(collateral) ?? {};

  const {
    decimals: baseAssetDecimals = 1,
    address: baseAssetAddress,
    price: baseAssetPriceUsd,
  } = useMarketBaseAsset() ?? {};

  const client = useQueryClient();

  /**
   * Should cancel any quote request except the latest
   * 
   * So, if the user types something within the supply field or changes
   * the multiplier value, the previous quote request will be canceled.
   */
  const queries = client.getQueriesData({
    queryKey: ['swap-quote', 'from'],
  });

  (async () => {
    try {
      await client.cancelQueries({
        queryKey: ['swap-quote', 'from'],
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
  const debouncedValue = useDebounce(supply, debounceDelay);
  const debouncedMultiplierValue = useDebounce(multiplierValue, debounceDelay);
  const debouncedSlippageValue = useDebounce(slippagePercent, debounceDelay);

  const amountAsBN = parseUnits(debouncedValue ?? '0', collateralDecimals);

  const multipliedAmount = BigInt(Math.trunc(debouncedMultiplierValue * 10000)) * (amountAsBN) / 10000n;

  const slippageAsN = parseFloat(debouncedSlippageValue ?? '0');
  
  const chainId = market?.chainInformation.chainId ?? 1;

  const collateralAmount = multipliedAmount - amountAsBN
  const baseAssetAmount =
    (collateralAmount * (collateralPriceUsd ?? 0n) * (10n ** BigInt(baseAssetDecimals))) /
    ((baseAssetPriceUsd ?? 0n) * (10n ** BigInt(collateralDecimals)))

  return useQuoteFrom({
    amount: baseAssetAmount,
    slippage: slippageAsN,
    chainId,
    fromTokenAddress: baseAssetAddress,
    toTokenAddress: toTokenAddress,
    userAddress: multiplierAddress ?? undefined,
    excludeDexs: marketFlashLoan?.protocol
  });
}
