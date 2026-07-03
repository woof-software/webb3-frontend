import { useContext } from 'react';

import { getSelectedMarketContext } from '@contexts/SelectedMarketContext';
import { LowercaseMap } from '@helpers/entities/LowercaseMap';
import { FlashLoanRecord } from '@helpers/leverage/leverage-api';
import { useFlashLoans } from '@hooks/flash-loan/useFlashLoans';

/**
 * A wrapper around useFlashLoans to avoid 'template' code around the target hook call.
 *
 * This function uses the selected market information from the context and retrieves the chain ID
 * and the collateral assets addresses from the market data, if available. It then utilizes the `useFlashLoans`
 * hook to prepare the flash loan data for listed tokens. If no valid market data is available,
 * the hook will return default flash loan data with undefined parameters.
 *
 * @return Returns the result of the `useFlashLoans` hook preconfigured
 *         with the chain ID and list of the market collaterals.
 */
export function useCollateralsFlashLoan() {
  const { selectedMarket } = useContext(getSelectedMarketContext());

  const [, market] = selectedMarket;

  let chainId: number | undefined;
  let assets: string[] | undefined;

  if (market?.type === 'MarketDataLoaded') {
    chainId = market.chainInformation.chainId;

    assets = new Array<string>(market.collateralAssets.length);

    for (const asset of market.collateralAssets) {
      assets.push(asset.address);
    }
  }

  const { data, ...query } = useFlashLoans(chainId, assets);

  let flashLoanDataMaybe: LowercaseMap<FlashLoanRecord> | undefined;

  if (assets && data) {
    flashLoanDataMaybe = data;
  }

  return {
    data: flashLoanDataMaybe,
    ...query
  };
}
