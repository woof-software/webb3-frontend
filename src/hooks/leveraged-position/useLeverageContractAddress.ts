import { useMarket } from '@hooks/useMarket';

/**
 * A hook returns the address of the contract which has ABi compatible with the multiplier feature.
 *
 * TODO: This hook should extract the addresses from the appropriate npm package after it will be created.
 */
export function useLeverageContractAddress(): string | null {
  const market = useMarket();

  if (!market) {
    return null;
  }

  switch (market.chainInformation.chainId) {
    case 42161: {
      return '0x2c9c50869fc6D3c19814123511bc920dBF02452f';
    }
    default: {
      return null;
    }
  }
}
