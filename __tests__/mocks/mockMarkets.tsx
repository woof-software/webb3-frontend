import { ReactNode } from 'react';

import { buildMarketsContextValue, MarketsContext } from '@contexts/MarketsContext';
import { ErrorMarket, MarketRegistryResponse, registryToMarkets } from '@helpers/marketRegistry';
import { MarketData } from '@types';

import mockMarketRegistryResponse from './mockMarketRegistryResponse.json';

export const MOCK_MARKET_REGISTRY = mockMarketRegistryResponse as MarketRegistryResponse;

const registryMarkets = registryToMarkets(MOCK_MARKET_REGISTRY);

export const MOCK_MARKETS: MarketData[] = registryMarkets.markets;
export const MOCK_DEFAULT_MARKET: MarketData = registryMarkets.defaultMarket;

export const MockMarketsProvider = ({
  children,
  isLoading = false,
  markets = MOCK_MARKETS,
  errorMarkets = registryMarkets.errorMarkets,
}: {
  children: ReactNode;
  isLoading?: boolean;
  markets?: MarketData[];
  errorMarkets?: ErrorMarket[];
}) => (
  <MarketsContext.Provider
    value={buildMarketsContextValue(isLoading ? undefined : { ...registryMarkets, markets, errorMarkets })}
  >
    {children}
  </MarketsContext.Provider>
);
