import { useQuery } from '@tanstack/react-query';
import { getAddress } from 'ethers/lib/utils';

import { useMarketsContext } from '@contexts/MarketsContext';
import { isNonStablecoinMarket } from '@helpers/baseAssetPrice';
import { convertApiResponse } from '@helpers/functions';
import { institutionalSupplyRewardRate } from '@helpers/institutionalRates';
import { filterLegacyCollateralSymbols } from '@helpers/legacyCollateral';
import { getMarket, getMarketDescriptors } from '@helpers/markets';
import { BASE_FACTOR, FACTOR_PRECISION, PRICE_PRECISION } from '@helpers/numbers';
import { getHistoricalMarketSummaryEndpoint, getLatestMarketSummaryEndpoint } from '@helpers/urls';
import { AggregatedHistoricalSummary, MarketData, MarketOverviewState, MarketSummary, StateType } from '@types';

const LATEST_SUMMARY_REFRESH_INTERVAL = 1000 * 60 * 10; // 10 minutes

export function useMarketsOverviewState(): MarketOverviewState {
  const { markets, registryVersionId } = useMarketsContext();
  // TODO: This can also be modified to use react-query
  const query = useQuery({
    // A new registry version re-derives the summaries from the new market list
    queryKey: ['marketOverviewState', registryVersionId],
    queryFn: () => getState(markets),
    initialData: [StateType.Loading],
    refetchInterval: LATEST_SUMMARY_REFRESH_INTERVAL,
    enabled: markets.length > 0,
  });

  return query.data;
}

type MarketSummaryResponse = {
  chainId: number;
  comet: {
    address: string;
  };
  borrowApr: string;
  supplyApr: string;
  totalBorrowValue: string;
  totalSupplyValue: string;
  totalCollateralValue: string;
  utilization: string;
  timestamp: number;
  date: string;
  baseUsdPrice: string;
  collateralAssetSymbols: string[];
};

const getState = async (markets: MarketData[], includeTestnets = false): Promise<MarketOverviewState> => {
  const latestMarketSummariesResponse = await fetch(getLatestMarketSummaryEndpoint(includeTestnets));
  const latestMarketSummaries = await latestMarketSummariesResponse.json();

  const sanitizedLatestMarketSummaries: MarketSummary[] = latestMarketSummaries
    .map(convertApiResponse)
    .map((marketSummary: MarketSummaryResponse) => sanitizeMarketSummary(markets, marketSummary))
    // Institutional markets add USDC-terms rewards on top of the supply rate for their current size
    .map((marketSummary: MarketSummary): MarketSummary => {
      const market = getMarket(markets, marketSummary.chainId, marketSummary.comet.address);
      if (!market?.institutional) {
        return marketSummary;
      }
      const institutionalSupplyRewardsAPR = institutionalSupplyRewardRate(marketSummary.totalSupplyValue);
      return {
        ...marketSummary,
        supplyAPR: marketSummary.supplyAPR + institutionalSupplyRewardsAPR,
        ...(institutionalSupplyRewardsAPR > 0n ? { institutionalSupplyRewardsAPR } : {}),
      };
    });

  const historicalMarketSummariesResponse = await fetch(getHistoricalMarketSummaryEndpoint(includeTestnets));
  const historicalMarketSummaries = await historicalMarketSummariesResponse.json();
  const sanitizedHistoricalMarketSummaries: MarketSummary[] = historicalMarketSummaries
    .map(convertApiResponse)
    .map((marketSummary: MarketSummaryResponse) => sanitizeMarketSummary(markets, marketSummary));

  // Aggregate historical summaries by date
  const aggregatedHistoricalSummaries = sanitizedHistoricalMarketSummaries.reduce<AggregatedHistoricalSummary[]>(
    (acc, marketSummary) => {
      const existingSummary = acc.find((summary) => summary.date === marketSummary.date);

      if (existingSummary) {
        existingSummary.totalBorrowValue += marketSummary.totalBorrowValue;
        existingSummary.totalSupplyValue += marketSummary.totalSupplyValue;
        existingSummary.totalCollateralValue += marketSummary.totalCollateralValue;
      } else {
        acc.push({
          date: marketSummary.date,
          totalBorrowValue: marketSummary.totalBorrowValue,
          totalSupplyValue: marketSummary.totalSupplyValue,
          totalCollateralValue: marketSummary.totalCollateralValue,
        });
      }

      return acc;
    },
    []
  );

  return [
    StateType.Hydrated,
    { latestMarketSummaries: sanitizedLatestMarketSummaries, historicalMarketSummaries: aggregatedHistoricalSummaries },
  ];
};

/**
 * Sanitize the values we get back from the API to a form that is more consistent
 * with the rest of the app.
 * 1. Convert all numbers to BigInts (except timestamp)
 * 2. Use USD values of each asset amount field with a base of PRICE_SCALE
 *
 * @param marketSummary
 * @returns
 */
export const sanitizeMarketSummary = (markets: MarketData[], marketSummary: MarketSummaryResponse): MarketSummary => {
  const baseUsdPrice = BigInt(Math.floor(Number(marketSummary.baseUsdPrice) * 10 ** PRICE_PRECISION));
  const borrowAPR = BigInt(Math.floor(Number(marketSummary.borrowApr) * 10 ** FACTOR_PRECISION));
  const supplyAPR = BigInt(Math.floor(Number(marketSummary.supplyApr) * 10 ** FACTOR_PRECISION));

  // Comet prices non-native markets in USD terms already. Thus, the API returns
  // USD values already for non-native markets. For the native token markets,
  // we need to convert the values to USD.
  const [baseAsset] = getMarketDescriptors(markets, marketSummary.comet.address, marketSummary.chainId);
  const isNativeAssetMarket = isNonStablecoinMarket(baseAsset);
  const usdPrice = isNativeAssetMarket ? baseUsdPrice : BigInt(10 ** PRICE_PRECISION);

  const totalBorrowValue = BigInt(Math.floor(Number(marketSummary.totalBorrowValue) * 10 ** FACTOR_PRECISION));
  const totalBorrowValueInDollars = (totalBorrowValue * usdPrice) / BASE_FACTOR;

  const totalSupplyValue = BigInt(Math.floor(Number(marketSummary.totalSupplyValue) * 10 ** FACTOR_PRECISION));
  const totalSupplyValueInDollars = (totalSupplyValue * usdPrice) / BASE_FACTOR;

  const totalCollateralValue = BigInt(Math.floor(Number(marketSummary.totalCollateralValue) * 10 ** FACTOR_PRECISION));
  const totalCollateralValueInDollars = (totalCollateralValue * usdPrice) / BASE_FACTOR;

  const utilization = BigInt(marketSummary.utilization);

  return {
    chainId: marketSummary.chainId,
    comet: {
      address: getAddress(marketSummary.comet.address),
    },
    borrowAPR: borrowAPR,
    supplyAPR: supplyAPR,
    totalBorrowValue: totalBorrowValueInDollars,
    totalSupplyValue: totalSupplyValueInDollars,
    totalCollateralValue: totalCollateralValueInDollars,
    utilization: utilization,
    timestamp: marketSummary.timestamp,
    date: marketSummary.date,
    collateralAssetSymbols: filterLegacyCollateralSymbols(
      marketSummary.chainId,
      baseAsset,
      marketSummary.collateralAssetSymbols ?? []
    ),
  };
};
