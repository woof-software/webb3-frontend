type MarketConfig = {
  comet: string;
  borrowRewardsAPR: bigint;
  supplyRewardsAPR: bigint;
  isBoosted?: boolean;
};

type RewardsConfig = Array<
  [
    chainId: number,
    markets: MarketConfig[],
  ]
>;


export const REWARDS_CONFIG: RewardsConfig = [
  [
    1,
    [
      {
        comet: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
        borrowRewardsAPR: 1379905919404118n,
        supplyRewardsAPR: 1243544116605595n,
        isBoosted: true,
      },
      {
        comet: "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
        borrowRewardsAPR: 1840730861894757n,
        supplyRewardsAPR: 682367647857447n,
        isBoosted: true,
      },
      {
        comet: "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840",
        borrowRewardsAPR: 1682069454439632n,
        supplyRewardsAPR: 1351220117801404n,
        isBoosted: true,
      },
      {
        comet: "0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x5D409e56D886231aDAf00c8775665AD0f9897b56",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0xe85Dc543813B8c2CFEaAc371517b925a166a9293",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    10,
    [
      {
        comet: "0x2e44e174f7D53F0212823acC11C01A11d58c5bCB",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x995E394b8B2437aC8Ce61Ee0bC610D617962B214",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0xE36A30D249f7761327fd973001A32010b521b6Fd",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    130,
    [
      {
        comet: "0x2c7118c4C88B9841FCF839074c26Ae8f035f2921",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x6C987dDE50dB1dcDd32Cd4175778C2a291978E2a",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    137,
    [
      {
        comet: "0xF25212E676D1F7F89Cd72fFEe66158f541246445",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0xaeB318360f27748Acb200CE616E389A6C9409a07",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [2020, []],
  [
    5000,
    [
      {
        comet: "0x606174f62cd968d8e684c645080fa694c1D7786E",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    8453,
    [
      {
        comet: "0x46e6b214b524310239732D51387075E0e70970bf",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0xb125E6687d4313864e53df431d5425969c15Eb2F",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x784efeB622244d2348d4F2522f8860B96fbEcE89",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x2c776041CCFe903071AF44aa147368a9c8EEA518",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    42161,
    [
      {
        comet: "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [
    59144,
    [
      {
        comet: "0x8D38A3d6B3c3B7d96D6536DA7Eef94A9d7dbC991",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
      {
        comet: "0x60F2058379716A64a7A5d29219397e79bC552194",
        borrowRewardsAPR: 0n,
        supplyRewardsAPR: 0n,
      },
    ],
  ],
  [534352, []],
];