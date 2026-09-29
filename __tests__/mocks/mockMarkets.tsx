import { ReactNode } from 'react';

import { buildMarketsContextValue, MarketsContext } from '@contexts/MarketsContext';
import { MarketRegistryResponse, registryToMarkets } from '@helpers/marketRegistry';
import { MarketData } from '@types';

import mockMarketRegistryResponse from './mockMarketRegistryResponse.json';

export const MOCK_MARKET_REGISTRY = mockMarketRegistryResponse as MarketRegistryResponse;

const registryMarkets = registryToMarkets(MOCK_MARKET_REGISTRY);
if (registryMarkets.defaultMarket === undefined) {
  throw new Error('Mock market registry must have a default market');
}

export const MOCK_MARKETS: MarketData[] = registryMarkets.markets;
export const MOCK_DEFAULT_MARKET: MarketData = registryMarkets.defaultMarket;

export const MockMarketsProvider = ({
  children,
  isLoading = false,
  markets = MOCK_MARKETS,
}: {
  children: ReactNode;
  isLoading?: boolean;
  markets?: MarketData[];
}) => (
  <MarketsContext.Provider
    value={
      isLoading
        ? buildMarketsContextValue([], undefined, true)
        : buildMarketsContextValue(markets, MOCK_DEFAULT_MARKET, false, MOCK_MARKET_REGISTRY.registryVersion.id)
    }
  >
    {children}
  </MarketsContext.Provider>
);
