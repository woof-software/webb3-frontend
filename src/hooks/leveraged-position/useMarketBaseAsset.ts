import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

/**
 * A wrapper around template code which extracts the base token of the selected market.
 *
 * It makes it easier to extract base asset within the domain logic.
 */
export const useMarketBaseAsset = () => {
  const state = useMarketCometState();

  return state?.baseAsset ?? null;
};
