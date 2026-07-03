import { useQuery } from '@tanstack/react-query';

import { fetchAgreementCurrent } from '@helpers/leverage/leverage-api';


/**
 * A custom hook that retrieves the current agreement details using a data-fetching query.
 *
 * @return Returns an object containing `data`, which holds the current agreement details
 * retrieved through the query.
 */
export function useAgreementCurrent() {
  return useQuery({
    queryKey: ['multiplier', 'agreement-current'],
    queryFn: async () => await fetchAgreementCurrent()
  });
}
