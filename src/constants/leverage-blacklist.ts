export type LeverageBlacklistedToken = {
  multiplier: boolean;
};

export const LEVERAGE_BLACKLIST: Record<number, Record<string, LeverageBlacklistedToken>> = {
  42161: {
    '0xd09acb80c1e8f2291862c4978a008791c9167003': {
      multiplier: true,
    }
  }
};
