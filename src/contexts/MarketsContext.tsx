import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import {
  ErrorMarket,
  fetchMarketRegistry,
  MARKET_REGISTRY_CACHE_MAX_AGE,
  MARKET_REGISTRY_QUERY_KEY,
  MARKET_REGISTRY_REFRESH_INTERVAL,
  MarketRegistryResponse,
  RegistryMarkets,
  registryToMarkets,
} from '@helpers/marketRegistry';
import { getMarket, getMarketDescriptors, getMarkets, getMarketsByNetwork } from '@helpers/markets';
import { MarketData, MarketsByNetwork } from '@types';

type MarketsHelpers = {
  getMarket: (chainId: number, marketAddress: string) => MarketData | undefined;
  getMarkets: (showTestnet: boolean) => MarketData[];
  getMarketsByNetwork: (showTestnet: boolean) => MarketsByNetwork;
  getMarketDescriptors: (cometAddress: string, chainId: number) => string[];
};

// Loading only until the first registry response (or restored cache) is available.
// Checking `isLoading` narrows `defaultMarket` and `registryVersionId` to defined values.
export type MarketsContextValue = MarketsHelpers &
  (
    | {
        isLoading: true;
        markets: MarketData[];
        defaultMarket: undefined;
        registryVersionId: undefined;
        errorMarkets: ErrorMarket[];
      }
    | ({ isLoading: false } & RegistryMarkets)
  );

export const MarketsContext = createContext<MarketsContextValue | undefined>(undefined);

const NO_MARKETS: MarketData[] = [];

export function buildMarketsContextValue(registryMarkets: RegistryMarkets | undefined): MarketsContextValue {
  const markets = registryMarkets?.markets ?? NO_MARKETS;
  const helpers: MarketsHelpers = {
    getMarket: (chainId, marketAddress) => getMarket(markets, chainId, marketAddress),
    getMarkets: (showTestnet) => getMarkets(markets, showTestnet),
    getMarketsByNetwork: (showTestnet) => getMarketsByNetwork(markets, showTestnet),
    getMarketDescriptors: (cometAddress, chainId) => getMarketDescriptors(markets, cometAddress, chainId),
  };

  return registryMarkets === undefined
    ? { ...helpers, isLoading: true, markets, defaultMarket: undefined, registryVersionId: undefined, errorMarkets: [] }
    : { ...helpers, isLoading: false, ...registryMarkets };
}

// A malformed cached/fetched registry must not crash the app (no ErrorBoundary wraps this provider).
// A throwing select leaves the query without data, so it is treated as loading while it keeps refetching.
function selectRegistryMarkets(response: MarketRegistryResponse): RegistryMarkets {
  try {
    return registryToMarkets(response);
  } catch (error) {
    console.warn('Market registry: failed to map response, treating as loading', error);
    throw error;
  }
}

export const MarketsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useQuery({
    queryKey: MARKET_REGISTRY_QUERY_KEY,
    queryFn: fetchMarketRegistry,
    select: selectRegistryMarkets,
    staleTime: MARKET_REGISTRY_REFRESH_INTERVAL,
    refetchInterval: MARKET_REGISTRY_REFRESH_INTERVAL,
    // Must outlive the persisted cache, otherwise the restored registry is garbage collected
    gcTime: MARKET_REGISTRY_CACHE_MAX_AGE,
    // Keep retrying in the background; the UI shows skeletons (no data yet) or the cached registry
    retry: true,
  });

  const value = useMemo(() => buildMarketsContextValue(data), [data]);

  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>;
};

export function useMarketsContext() {
  const context = useContext(MarketsContext);
  if (!context) throw new Error('MarketsContext not found');
  return context;
}
