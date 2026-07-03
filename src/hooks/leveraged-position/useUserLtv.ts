import { getRiskLevelAndPercentage } from '@helpers/numbers';
import { useUserDebt } from '@hooks/leveraged-position/useUserDebt';
import { useUserLiquidationCapacity } from '@hooks/leveraged-position/useUserLiquidationCapacity';

export type UseCustomLtvArgs = {
  changes?: Record<string, bigint>;
}

/**
 * Calculates the liquidation risk percentage for a user's collateral assets based on their balances,
 * liquidation factors and quote.
 * 
 * Pass an object with predefined changes to see how it affects the user position.
 */
export function useUserLtv(args?: UseCustomLtvArgs) {
  const userDebt = useUserDebt(args);

  const borrowLiquidationCapacity = useUserLiquidationCapacity(args);

  const { 1: result } = getRiskLevelAndPercentage(userDebt, borrowLiquidationCapacity);

  return result;
}
