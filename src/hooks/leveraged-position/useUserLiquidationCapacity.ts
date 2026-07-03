import { BASE_FACTOR } from '@helpers/numbers';
import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

export type UseBorrowCapacityValueArgs = {
  changes?: Record<string, bigint>;
}

/**
 * Calculates the user unsafe borrowing capacity based on the liquidation factor.
 * 
 * Pass an object with predefined changes to see how it affects the user position.
 * 
 * (Liquidation capacity means the same thing as liquidation point)
 */
export function useUserLiquidationCapacity(args?: UseBorrowCapacityValueArgs) {
  const {
    changes = {}
  } = args ?? {};

  const state = useMarketCometState();

  const collateralAssets = state?.collateralAssets ?? [];

  return collateralAssets.reduce((totalCapacity, collateral) => {
    const balance = collateral.balance + (changes[collateral.address] ?? 0n);

    const balanceValue = (balance * collateral.price) / 10n ** BigInt(collateral.decimals);

    const borrowCapacityValue = (balanceValue * collateral.liquidateCollateralFactor) / BASE_FACTOR;

    return totalCapacity + borrowCapacityValue;
  }, 0n);
}
