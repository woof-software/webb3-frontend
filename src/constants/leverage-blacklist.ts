export type LeverageBlacklistedToken = {
  swap: {
    to: boolean,
    from: boolean,
  },
  repay: boolean,
};

export const LEVERAGE_BLACKLIST: Record<number, Record<string, LeverageBlacklistedToken>> = {
  42161: {
    '0xd09ACb80C1E8f2291862c4978A008791c9167003': {
      swap: {
        to: true,
        from: true
      },
      repay: true
    },
    '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a': {
      swap: {
        to: false,
        from: false
      },
      repay: true
    },
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8': {
      swap: {
        to: false,
        from: false
      },
      repay: true
    },
    '0x4186bfc76e2e237523cbc30fd220fe055156b41f': {
      swap: {
        to: false,
        from: true
      },
      repay: false
    },
    '0x2416092f143378750bb29b79ed961ab195cceea5': {
      swap: {
        to: false,
        from: true
      },
      repay: true
    }
  }
};

