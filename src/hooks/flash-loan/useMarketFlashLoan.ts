import { useContext } from 'react';

import { getSelectedMarketContext } from '@contexts/SelectedMarketContext';
import { FlashLoanRecord } from '@helpers/leverage/leverage-api';
import { useFlashLoans } from '@hooks/flash-loan/useFlashLoans';

/**
 * A wrapper around useFlashLoans to avoid 'template' code around the target hook call.
 *
 * This function uses the selected market information from the context and retrieves the chain ID
 * and the base asset address from the market data, if available. It then utilizes the `useFlashLoans`
 * hook to prepare the flash loan data for the specific market. If no valid market data is available,
 * the hook will return default flash loan data with undefined parameters.
 *
 * @return Returns the result of the `useFlashLoans` hook preconfigured
 *         with the chain ID and base asset address of the selected market.
 *         However, it returns the single entity instead of the Map.
 */
export function useMarketFlashLoan() {
  const { selectedMarket } = useContext(getSelectedMarketContext());

  const [, market] = selectedMarket;

  let chainId: number | undefined;
  let asset: string | undefined;

  if (market?.type === 'MarketDataLoaded') {
    chainId = market.chainInformation.chainId;
    asset = market.baseAsset.address;
  }

  const { data, ...query } = useFlashLoans(chainId, asset ? [asset] : undefined);

  let flashLoanDataMaybe: FlashLoanRecord | undefined;

  if (asset && data) {
    flashLoanDataMaybe = data.get(asset);
  }

  return {
    data: flashLoanDataMaybe,
    ...query
  };
}
