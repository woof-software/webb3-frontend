export const getNetBorrowAPR = (borrowAPR: bigint, borrowRewardsAPR?: bigint) => {
  if (borrowRewardsAPR === undefined) return borrowAPR;
  return borrowAPR - borrowRewardsAPR;
};

export const getNetSupplyAPR = (earnAPR: bigint, earnRewardsAPR?: bigint) => {
  if (earnRewardsAPR === undefined) return earnAPR;
  return earnAPR + earnRewardsAPR;
};