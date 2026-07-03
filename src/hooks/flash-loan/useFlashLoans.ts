import { useQuery } from '@tanstack/react-query';

import { LowercaseMap } from '@helpers/entities/LowercaseMap';
import { compareAddresses } from '@helpers/functions';
import { fetchFlashLoans, FlashLoanRecord } from '@helpers/leverage/leverage-api';

// Keeps a link to the default object always the same (to avoid useMemo usage for the hook)
const DEFAULT_VALUE = new Map<string, FlashLoanRecord>();

// TODO: Check is cache TTL may be longer
const CACHE_TTL = 60 * 1000;

/**
 * Retrieves loan reserves for a given chain and set of collaterals.
 *
 * This function fetches loan details based on the provided chain ID and collaterals.
 * It uses a query mechanism to retrieve the data and ensures any missing or incomplete
 * data is handled appropriately.
 *
 * @param [chain] - The chain ID for which loan data should be retrieved.
 * @param [assets] - An array of collateral addresses to filter loans by.
 * @return An object containing the loan data and query options, including the query state and control parameters.
 */
export function useFlashLoans(chain?: number, assets?: string[]) {
  const collateralsAsKey = [...assets ?? []].sort(compareAddresses);

  const { data, ...options } = useQuery<LowercaseMap<FlashLoanRecord>>({
    queryKey: ['flash-loans', chain, collateralsAsKey],
    enabled: !!chain && !!assets && assets.length > 0,
    queryFn: async (): Promise<Map<string, FlashLoanRecord>> => {
      if (!chain || !assets?.length) {
        return new LowercaseMap<FlashLoanRecord>();
      }

      const records = await fetchFlashLoans({ chainId: chain, assets });

      return new LowercaseMap<FlashLoanRecord>(Object.entries(records));
    },
    staleTime: CACHE_TTL,
    gcTime: CACHE_TTL
  });

  return { data: data ?? DEFAULT_VALUE, ...options };
}
