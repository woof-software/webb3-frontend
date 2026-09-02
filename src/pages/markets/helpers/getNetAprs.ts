import { RewardsState, StateType } from '@types';

/**
 * - `earnRewardsAPR`: The APR for earning rewards on the asset, represented as a bigint.
 * - `borrowRewardsAPR`: The APR for borrowing rewards on the asset, represented as a bigint.
 */
type BoostedAPRs = Record<string, {
  earnRewardsAPR: bigint;
  borrowRewardsAPR: bigint;
}>;

/**
 * Computes and retrieves the reward APRs (Annual Percentage Rates) associated with a set of markets
 * for a specified blockchain network, based on the provided rewards state.
 *
 * rewards - The state object containing rewards data.
 * chainId - The identifier of the blockchain network for which the reward APRs need to be determined.
 * markets - An array of market identifiers for which to calculate the reward APRs.
 * @returns  An object mapping each specified market to its corresponding reward APRs,
 *                        including both earn rewards APR and borrow rewards APR. If no valid data
 *                        is found, an empty object is returned.
 */
export const getRewardsAPRs = (
  rewards: RewardsState,
  chainId: number,
  markets: string[],
): BoostedAPRs => {
  if (rewards[1]) {
    const chainEntry = rewards[1].find(([id]) => Number(id) === chainId);
    if (!chainEntry) return {};

    const [, chainData] = chainEntry;

    return chainData.rewardsStates.reduce<BoostedAPRs>((acc, state) => {
      if (markets.includes(state.comet)) {
        acc[state.comet] = {
          earnRewardsAPR: state.earnRewardsAPR,
          borrowRewardsAPR: state.borrowRewardsAPR,
        };
      }
      return acc;
    }, {});
  }

  return {};
};

export const getNetBorrowAPR = (borrowAPR: bigint, borrowRewardsAPR?: bigint) => {
  return borrowRewardsAPR !== undefined ? borrowAPR - borrowRewardsAPR : borrowAPR;
}

export const getNetSupplyAPR = (earnAPR: bigint, earnRewardsAPR?: bigint) => {
  return earnRewardsAPR !== undefined ? earnRewardsAPR + earnAPR : earnAPR;
}