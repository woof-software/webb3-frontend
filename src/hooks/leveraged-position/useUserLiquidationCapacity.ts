import { BASE_FACTOR } from '@helpers/numbers';
import { useMarketCometState } from '@hooks/leveraged-position/useMarketCometState';

export type UseBorrowCapacityValueArgs = {
  changes?: Record<string, bigint>;
}

/**
 * Calculates USD value of borrow capacity for a user's collateral assets based on their balances.
 * Using `changes` it is possible to see how change within balances will affect the borrow capacity value.
 *
 * ```
 * useBorrowCapacityValue({ changes: { '0x123': -100000000n } })
 * ```
 *
 * Returns current borrow capacity where the value of the `0x123` asset has been affected as `balance - 100000000n`
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
