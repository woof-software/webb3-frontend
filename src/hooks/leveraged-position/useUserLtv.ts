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
 * Liquidation Risk calculation algorithm:
 *  - Let `base` be the base asset token;
 *  - Let `loan` be the base asset amount when the user has a borrowing position + quote `from` value;
 *  - Let the `liquidation point` be 0;
 *  - Each `collateral` of the user collaterals
 *    - Let balance be the `collateral` balance on the protocol
 *      - If the Multiplier selected `collateral` is `collateral`, then `balance` + quote `to` value
 *    - Let a `factor` be the Liquidation Factor of collateral
 *    - Let `X` be the `convert(balance, base)`
 *    - Let `Y` be the `X` * `factor`
 *    - liquidation `point` + `Y`
 *  - liquidation risk percentage of (loan, liquidation point)
 *
 *  if `excludeQuoteData` is passed, then swap quote data will be ignored
 */
export function useUserLtv(args?: UseCustomLtvArgs) {
  const userDebt = useUserDebt(args);

  const borrowLiquidationCapacity = useUserLiquidationCapacity(args);

  const { 1: result } = getRiskLevelAndPercentage(userDebt, borrowLiquidationCapacity);

  return result;
}
