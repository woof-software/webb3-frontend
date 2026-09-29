import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import {
  fetchMarketRegistry,
  MARKET_REGISTRY_CACHE_MAX_AGE,
  MARKET_REGISTRY_QUERY_KEY,
  MARKET_REGISTRY_REFRESH_INTERVAL,
  registryToMarkets,
} from '@helpers/marketRegistry';
import { getDefaultMarket, getMarket, getMarketDescriptors, getMarkets, getMarketsByNetwork } from '@helpers/markets';
import { MarketData, MarketsByNetwork } from '@types';

export type MarketsContextValue = {
  markets: MarketData[];
  defaultMarket: MarketData | undefined;
  // True only until the first registry response (or restored cache) is available
  isLoading: boolean;
  registryVersionId: string | undefined;
  getMarket: (chainId: number, marketAddress: string) => MarketData | undefined;
  getMarkets: (showTestnet: boolean) => MarketData[];
  getMarketsByNetwork: (showTestnet: boolean) => MarketsByNetwork;
  getMarketDescriptors: (cometAddress: string, chainId: number) => string[];
};

export const MarketsContext = createContext<MarketsContextValue | undefined>(undefined);

export function buildMarketsContextValue(
  markets: MarketData[],
  defaultMarket: MarketData | undefined,
  isLoading: boolean,
  registryVersionId?: string,
): MarketsContextValue {
  return {
    markets,
    defaultMarket: defaultMarket ?? getDefaultMarket(markets),
    isLoading,
    registryVersionId,
    getMarket: (chainId, marketAddress) => getMarket(markets, chainId, marketAddress),
    getMarkets: (showTestnet) => getMarkets(markets, showTestnet),
    getMarketsByNetwork: (showTestnet) => getMarketsByNetwork(markets, showTestnet),
    getMarketDescriptors: (cometAddress, chainId) => getMarketDescriptors(markets, cometAddress, chainId),
  };
}

export const MarketsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useQuery({
    queryKey: MARKET_REGISTRY_QUERY_KEY,
    queryFn: fetchMarketRegistry,
    staleTime: MARKET_REGISTRY_REFRESH_INTERVAL,
    refetchInterval: MARKET_REGISTRY_REFRESH_INTERVAL,
    // Must outlive the persisted cache, otherwise the restored registry is garbage collected
    gcTime: MARKET_REGISTRY_CACHE_MAX_AGE,
    // Keep retrying in the background; the UI shows skeletons (no data yet) or the cached registry
    retry: true,
  });

  const value = useMemo(() => {
    if (data === undefined) {
      return buildMarketsContextValue([], undefined, true);
    }
    try {
      const { markets, defaultMarket } = registryToMarkets(data);
      return buildMarketsContextValue(markets, defaultMarket, false, data.registryVersion.id);
    } catch (error) {
      // A malformed cached/fetched registry must not crash the app (no ErrorBoundary wraps this provider).
      // Treat it as "no data": skeletons are shown while the query keeps refetching/retrying in the background.
      console.warn('Market registry: failed to map response, treating as loading', error);
      return buildMarketsContextValue([], undefined, true);
    }
  }, [data]);

  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>;
};

export function useMarketsContext() {
  const context = useContext(MarketsContext);
  if (!context) throw new Error('MarketsContext not found');
  return context;
}
