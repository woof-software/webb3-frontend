import { REWARDS_CONFIG } from '@constants/rewardsConfig';
import { RewardsState } from '@types';

export type RewardConfigEntry = {
  supplyRewardsAPR: bigint;
  borrowRewardsAPR: bigint;
  isBoosted: boolean;
};

type RewardConfigByAddress = Record<string, RewardConfigEntry>;
type ContextRewardsAPRs = Record<string, { earnRewardsAPR: bigint; borrowRewardsAPR: bigint }>;

export const getRewardsConfigForChain = (chainId: number): RewardConfigByAddress => {
  const chainEntry = REWARDS_CONFIG.find(([id]) => id === chainId);
  if (!chainEntry) return {};

  const [, marketConfigs] = chainEntry;

  return marketConfigs.reduce<RewardConfigByAddress>((acc, market) => {
    acc[market.comet.toLowerCase()] = {
      supplyRewardsAPR: market.supplyRewardsAPR,
      borrowRewardsAPR: market.borrowRewardsAPR,
      isBoosted: market.isBoosted === true,
    };
    return acc;
  }, {});
};

export const getContextRewardsAPRs = (rewards: RewardsState, chainId: number): ContextRewardsAPRs => {
  const chainEntry = rewards[1]?.find(([id]) => Number(id) === chainId);
  if (!chainEntry) return {};

  const [, chainData] = chainEntry;

  return chainData.rewardsStates.reduce<ContextRewardsAPRs>((acc, state) => {
    acc[state.comet.toLowerCase()] = {
      earnRewardsAPR: state.earnRewardsAPR,
      borrowRewardsAPR: state.borrowRewardsAPR,
    };
    return acc;
  }, {});
};


export const getNetBorrowAPR = (
  borrowAPR: bigint,
  borrowRewardsAPR?: bigint,
  configBorrowRewardsAPR?: bigint,
) => {
  if (borrowRewardsAPR === undefined) return borrowAPR;
  return borrowAPR - borrowRewardsAPR - (configBorrowRewardsAPR ?? 0n);
};


export const getNetSupplyAPR = (
  earnAPR: bigint,
  earnRewardsAPR?: bigint,
  configSupplyRewardsAPR?: bigint,
) => {
  if (earnRewardsAPR === undefined) return earnAPR;
  return earnAPR + earnRewardsAPR + (configSupplyRewardsAPR ?? 0n);
};