type RewardSpeedConfig = {
  supplySpeed: bigint;
  borrowSpeed: bigint;
};

// speeds will appear in future
export const REWARD_SPEEDS: Record<string, RewardSpeedConfig> = {
  '0xA17581A9E3356d9A858b789D68B4d866e593aE94': {
    supplySpeed: 2979166666666n,
    borrowSpeed: 4414467592592n,
  },
  '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840': {
    supplySpeed: 2979166666666n,
    borrowSpeed: 4414467592592n,
  },
  '0xc3d688B66703497DAA19211EEdff47f25384cdc3': {
    supplySpeed: 2979166666666n,
    borrowSpeed: 4414467592592n,
  },
};