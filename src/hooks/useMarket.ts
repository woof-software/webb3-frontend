import { useContext } from 'react';

import { getSelectedMarketContext } from '@contexts/SelectedMarketContext';
import { StateType } from '@types';

/**
 * A wrapper around template code which extracts the state of the selected market.
 *
 * It makes it easier to state extraction within the domain logic.
 */
export function useMarket() {
  const selectedMarketState = useContext(getSelectedMarketContext());

  const [type, state] = selectedMarketState.selectedMarket;

  if (type !== StateType.Hydrated) {
    return null;
  }

  return state;
}
