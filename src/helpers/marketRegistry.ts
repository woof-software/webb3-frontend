import type { Query } from '@tanstack/react-query';
import { getAddress } from 'ethers/lib/utils';

import { CHAINS } from '@constants/chains';
import { iconNameForChainId } from '@helpers/assets';
import { V2_MARKET } from '@helpers/markets';
import { getMarketRegistryEndpoint } from '@helpers/urls';
import { ChainInformation, MarketData } from '@types';

// Only the parts of the /registry/v1/active response the app reads are typed here.
export type RegistryMarket = {
  deploymentKey: string;
  displayName: string;
  slug: string | null;
  isDefault: boolean;
  isInstitutional: boolean;
  status: string;
  contracts: {
    comet: string;
    bulker: string;
    rewards: string | null;
    fauceteer: string | null;
  };
  baseAsset: {
    displayName: string;
  };
};

export type RegistryNetwork = {
  chainId: number;
  markets: RegistryMarket[];
};

export type MarketRegistryResponse = {
  schemaVersion: number;
  registryVersion: { id: string };
  networks: RegistryNetwork[];
};

export const MARKET_REGISTRY_SCHEMA_VERSION = 1;
export const MARKET_STATUS_ERROR = 'error';

export const MARKET_REGISTRY_QUERY_KEY = ['marketRegistry'] as const;
export const MARKET_REGISTRY_REFRESH_INTERVAL = 1000 * 60 * 10; // 10 minutes
export const MARKET_REGISTRY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
// Bump when the persisted response shape changes so stale caches are dropped
export const MARKET_REGISTRY_CACHE_BUSTER = 'market-registry-v1';

// Only the market registry is persisted to localStorage
export function shouldPersistQuery(query: Query): boolean {
  return query.queryKey[0] === MARKET_REGISTRY_QUERY_KEY[0] && query.state.status === 'success';
}

// Base assets that are wrapped native tokens shown unwrapped in the UI (e.g. ETH for the WETH market).
// Their URL key uses the wrapped symbol ('weth-mainnet').
const WRAPPED_BASE_ASSETS = ['ETH'];

const registryMarketId = (chainId: number, deploymentKey: string) => `${chainId}:${deploymentKey}`;

export const MARKET_PRIORITY: string[] = [
  '1:usdc',
  '1:weth',
  '1:usdt',
  '1:wsteth',
  '1:usds',
  '1:wbtc',
  '1:institutional_usdc',
  '137:usdc',
  '137:usdt',
  '42161:usdc',
  '42161:usdc.e',
  '42161:weth',
  '42161:usdt',
  '10:usdc',
  '10:usdt',
  '10:weth',
  '8453:usdc',
  '8453:usdbc',
  '8453:usds',
  '8453:weth',
  '8453:aero',
  '534352:usdc',
  '5000:usde',
  '59144:usdc',
  '130:usdc',
  '130:weth',
  '2020:weth',
  '2020:wron',
  '59144:weth',
];

export const MARKET_OVERRIDES: Record<string, Pick<MarketData, 'isNew' | 'rewardsOverwrite'>> = {
  '1:usdc': {
    rewardsOverwrite: {
      rewardsAssetSymbol: 'COMP',
      supplyCompPerDay: 55n * 10n ** 18n,
      borrowCompPerDay: 55n * 10n ** 18n,
    },
  },
  '1:weth': {
    rewardsOverwrite: {
      rewardsAssetSymbol: 'COMP',
      supplyCompPerDay: 10n * 10n ** 18n,
      borrowCompPerDay: 20n * 10n ** 18n,
    },
  },
  '1:usdt': {
    rewardsOverwrite: {
      rewardsAssetSymbol: 'COMP',
      supplyCompPerDay: 30n * 10n ** 18n,
      borrowCompPerDay: 30n * 10n ** 18n,
    },
  },
  '1:institutional_usdc': { isNew: true },
};

const priorityOf = (id: string): number => {
  const index = MARKET_PRIORITY.indexOf(id);
  return index === -1 ? MARKET_PRIORITY.length : index;
};

// Runs `build`, warning and skipping (returning undefined) instead of throwing on malformed registry data
function tryOrWarn<T>(build: () => T, warning: string): T | undefined {
  try {
    return build();
  } catch {
    console.warn(warning);
    return undefined;
  }
}

function toMarketData(chainId: number, chainInformation: ChainInformation, market: RegistryMarket): MarketData {
  const { contracts } = market;
  return {
    baseAsset: {
      symbol: market.displayName,
      name: market.baseAsset.displayName,
      isWrapped: WRAPPED_BASE_ASSETS.includes(market.displayName),
    },
    chainInformation,
    iconPair: [market.isInstitutional ? 'INSTITUTIONAL' : iconNameForChainId(chainId), market.displayName],
    marketAddress: getAddress(contracts.comet),
    bulkerAddress: getAddress(contracts.bulker),
    ...(contracts.rewards ? { rewardsAddress: getAddress(contracts.rewards) } : {}),
    ...(contracts.fauceteer ? { fauceteerAddress: getAddress(contracts.fauceteer) } : {}),
    ...(market.slug ? { slug: market.slug } : {}),
    ...(market.isInstitutional ? { institutional: true } : {}),
    ...MARKET_OVERRIDES[registryMarketId(chainId, market.deploymentKey)],
    type: 'MarketData',
  };
}

export type ErrorMarket = { chainId: number; marketAddress: string };

export type RegistryMarkets = {
  markets: MarketData[];
  defaultMarket: MarketData;
  registryVersionId: string;
  // Markets in the error status; they are left out of `markets` and hidden from the UI
  errorMarkets: ErrorMarket[];
};

export function isErrorMarket(errorMarkets: ErrorMarket[], chainId: number, marketAddress: string): boolean {
  return errorMarkets.some(
    (market) => market.chainId === chainId && market.marketAddress.toLowerCase() === marketAddress.toLowerCase()
  );
}

export function registryToMarkets(response: MarketRegistryResponse): RegistryMarkets {
  const entries: { id: string; isDefault: boolean; market: MarketData }[] = [];
  const errorMarkets: ErrorMarket[] = [];

  for (const network of response.networks) {
    const chainInformation = CHAINS[network.chainId];
    if (chainInformation === undefined) {
      // Without a CHAINS entry there is no RPC, URL key or wallet config for the network
      console.warn(`Market registry: skipping markets on unsupported chain ${network.chainId}`);
      continue;
    }

    for (const market of network.markets) {
      // Markets in the error status are not shown anywhere in the UI
      if (market.status === MARKET_STATUS_ERROR) {
        errorMarkets.push({ chainId: network.chainId, marketAddress: market.contracts.comet });
        continue;
      }

      const id = registryMarketId(network.chainId, market.deploymentKey);
      const marketData = tryOrWarn(
        () => toMarketData(network.chainId, chainInformation, market),
        `Market registry: skipping market ${id} (invalid data)`,
      );
      if (marketData === undefined) continue;
      entries.push({ id, isDefault: market.isDefault, market: marketData });
    }
  }

  entries.sort((a, b) => priorityOf(a.id) - priorityOf(b.id));

  // Without a registry default the first market in selector order is used
  const defaultMarket = (entries.find((entry) => entry.isDefault) ?? entries[0])?.market;
  if (defaultMarket === undefined) {
    throw new Error('Market registry response has no supported markets');
  }

  return {
    // This is a faux supported market for Compound V2 and points to comptroller address
    markets: [...entries.map((entry) => entry.market), V2_MARKET],
    defaultMarket,
    registryVersionId: response.registryVersion.id,
    errorMarkets,
  };
}

export function validateMarketRegistry(json: unknown): MarketRegistryResponse {
  const response = json as Partial<MarketRegistryResponse> | null;
  if (response?.schemaVersion !== MARKET_REGISTRY_SCHEMA_VERSION) {
    throw new Error(`Unsupported market registry schema version: ${response?.schemaVersion}`);
  }
  if (!Array.isArray(response.networks)) {
    throw new Error('Market registry response has no networks');
  }

  const registry = response as MarketRegistryResponse;
  // Throws when the response has no supported markets
  registryToMarkets(registry);
  return registry;
}

export async function fetchMarketRegistry(): Promise<MarketRegistryResponse> {
  const response = await fetch(getMarketRegistryEndpoint());
  if (!response.ok) {
    throw new Error(`Market registry request failed with status ${response.status}`);
  }
  return validateMarketRegistry(await response.json());
}
