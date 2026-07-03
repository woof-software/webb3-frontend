import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

/**
 * A utility hook that retrieves a specific market collateral asset by its address.
 *
 * @param collateral - The address of the collateral asset to find. Can be undefined or null.
 * @returns - The matching collateral asset object if found, otherwise null.
 *
 * This function uses various contexts related to the web3 environment, selected market state,
 * and transaction manager to evaluate the current state of the market's collateral assets.
 * It returns the specific collateral asset matching the provided address if the state is hydrated
 * and the asset is found. If the state is not hydrated or the asset is not found, it returns null.
 */
export const useMarketCollateral = (collateral?: string | null) => {
  const state = useMarketCometState();

  if (!state) {
    return null;
  }

  const { collateralAssets } = state;

  return collateralAssets.find((asset) => asset.address === collateral) ?? null;
};
