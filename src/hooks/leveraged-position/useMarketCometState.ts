import LeveragedPositionContext from '@contexts/LeveragedPositionContext';
import { StateType } from '@types';

/**
 * Utility hook that retrieves the current Comet state of the selected market.
 */
export const useMarketCometState = () => {
  const { cometState } = LeveragedPositionContext.use();

  if (cometState[0] !== StateType.Hydrated) {
    return null;
  }

  return cometState[1];
};
