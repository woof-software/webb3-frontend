export const getNetBorrowAPR = (borrowAPR: bigint, borrowRewardsAPR?: bigint) => {
  return borrowRewardsAPR ? borrowAPR - borrowRewardsAPR : borrowAPR;
}

export const getNetSupplyAPR = (earnAPR: bigint, earnRewardsAPR?: bigint) => {
  return earnRewardsAPR ? earnRewardsAPR + earnAPR : earnAPR;
}