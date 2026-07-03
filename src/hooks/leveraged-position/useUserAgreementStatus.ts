import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';

import { fetchAgreementsStatus, FetchAgreementsStatusRecord } from '@helpers/leverage/leverage-api';

/**
 * Custom hook to fetch and manage user agreement data based on the connected wallet address.
 * not stored in a cache
 *
 * @return An object containing the fetched agreement data under the `data` property.
 */
export function useUserAgreementStatus(walletAddress?: string | null) {
  return useQuery<FetchAgreementsStatusRecord | undefined>({
    queryKey: ['multiplier', 'agreement', walletAddress],
    enabled: isAddress(walletAddress ?? ''),
    queryFn: async () => {
      if (!walletAddress) return;

      return await fetchAgreementsStatus(walletAddress);
    }
  });
}
