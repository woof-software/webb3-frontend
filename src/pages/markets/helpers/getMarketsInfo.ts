import { MARKETS_CONFIG } from '@constants/marketsConfig';
import { RewardsState } from '@types';

export const DYNAMIC_SOURCED_CHAIN_IDS = new Set([5000, 59144]); // Mantle, Linea

export type MarketConfigEntry = {
  supplyAPR: bigint;
  borrowAPR: bigint;
  supplyRewardsAPR: bigint;
  borrowRewardsAPR: bigint;
  isBoosted: boolean;
};

type MarketConfigByAddress = Record<string, MarketConfigEntry>;
type ContextRewardsAPRs = Record<string, { earnRewardsAPR: bigint; borrowRewardsAPR: bigint }>;

export const getMarketsConfigForChain = (chainId: number): MarketConfigByAddress => {
  const chainEntry = MARKETS_CONFIG.find(([id]) => id === chainId);

  if (!chainEntry) {
    return {};
  }

  const [, marketConfigs] = chainEntry;

  return marketConfigs.reduce<MarketConfigByAddress>((acc, market) => {
    acc[market.comet.toLowerCase()] = {
      supplyAPR: market.supplyAPR,
      borrowAPR: market.borrowAPR,
      supplyRewardsAPR: market.supplyRewardsAPR,
      borrowRewardsAPR: market.borrowRewardsAPR,
      isBoosted: market.isBoosted === true,
    };

    return acc;
  }, {});
};


export const getContextRewardsAPRs = (rewards: RewardsState, chainId: number): ContextRewardsAPRs => {
  if (!DYNAMIC_SOURCED_CHAIN_IDS.has(chainId)) {
    return {};
  }

  const chainEntry = rewards[1]?.find(([id]) => Number(id) === chainId);

  if (!chainEntry) {
    return {};
  }

  const [, chainData] = chainEntry;

  return chainData.rewardsStates.reduce<ContextRewardsAPRs>((acc, state) => {
    acc[state.comet.toLowerCase()] = {
      earnRewardsAPR: state.earnRewardsAPR,
      borrowRewardsAPR: state.borrowRewardsAPR,
    };
    return acc;
  }, {});
};

export const getNetBorrowAPR = (borrowAPR: bigint, borrowRewardsAPR?: bigint) => {
  return borrowRewardsAPR !== undefined ? borrowAPR - borrowRewardsAPR : borrowAPR;
}

export const getNetSupplyAPR = (earnAPR: bigint, earnRewardsAPR?: bigint) => {
  return earnRewardsAPR !== undefined ? earnRewardsAPR + earnAPR : earnAPR;
}