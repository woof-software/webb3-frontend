import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralsFlashLoan } from '@hooks/flash-loan/useCollateralsFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useDebounce } from '@hooks/useDebounce';
import { useMarket } from '@hooks/useMarket';
import { useQuoteFrom } from '@hooks/useQuoteFrom';

/**
 * A custom hook for managing and using quotes in collateral swaps.
 * Handles debounced input changes, quote request cancellations, and calculations based on user input and market data.
 */
export const useCollateralSwapQuote = () => {
  const {
    inputValue,
    slippagePercent,
    fromAddress,
    toAddress
  } = CollateralSwapContext.use();

  const market = useMarket();

  const swapCollateralAddress = useLeverageContractAddress();
  const client = useQueryClient();

  const fromCollateral = useMarketCollateral(fromAddress);

  const { data: collateralsFlashLoan } = useCollateralsFlashLoan();

  const collateralFlashLoan = collateralsFlashLoan?.get(toAddress);

  const {
    decimals: fromDecimals = 1
  } = fromCollateral ?? {};

  /**
   * Should cancel any quote request except the latest
   *
   * So, if the user types something with the inputValue field or changes
   * the multiplier value, the previous quote request will be canceled.
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
  const debouncedFromAddress = useDebounce(fromAddress, debounceDelay);
  const debouncedToAddress = useDebounce(toAddress, debounceDelay);

  const amountAsBN = parseUnits(debouncedValue ?? '0', fromDecimals);
  const slippageAsN = parseFloat(debouncedSlippageValue ?? '0');

  const chainId = market?.chainInformation.chainId ?? 1;

  const { data, ...query } = useQuoteFrom({
    amount: amountAsBN,
    slippage: slippageAsN,
    chainId: chainId,
    fromTokenAddress: debouncedFromAddress,
    toTokenAddress: debouncedToAddress,
    userAddress: swapCollateralAddress ?? undefined,
    excludeDexs: collateralFlashLoan?.protocol
  });

  return {
    data: (data?.fromToken.toLowerCase() === fromAddress.toLowerCase() && data?.toToken.toLowerCase() === toAddress.toLowerCase()) ? data : undefined,
    ...query
  };
};
