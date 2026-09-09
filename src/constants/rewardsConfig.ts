import { Token } from '@types';

export type RewardConfig = {
  borrowRewardsAPR: bigint;
  supplyRewardsAPR: bigint;
  rewardsAsset: Token;
};

export type RewardsConfig = Record<number, Record<string, RewardConfig>>;

const rewardsAsset = {
  address: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  decimals: 18,
  name: "Compound Governance Token",
  symbol: "COMP"
};

export const REWARDS_CONFIG: RewardsConfig = {
  1: {
    "0xc3d688B66703497DAA19211EEdff47f25384cdc3": {
      borrowRewardsAPR: 2579905919404118n,
      supplyRewardsAPR: 2043544116605595n,
      rewardsAsset: rewardsAsset
    },
    "0xA17581A9E3356d9A858b789D68B4d866e593aE94": {
      borrowRewardsAPR: 2540730861894757n,
      supplyRewardsAPR: 802367647857447n,
      rewardsAsset: rewardsAsset
    },
    "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840": {
      borrowRewardsAPR: 2382069454439632n,
      supplyRewardsAPR: 1851220117801404n,
      rewardsAsset: rewardsAsset
    }
  },
};