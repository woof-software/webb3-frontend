import { ChainInformation } from '@types';

export const assetIconForAssetSymbol = (symbol: string): string => {
  switch (symbol) {
    case 'USDC.e':
      return 'USDC';
    case 'USDbC':
      return 'USDC';
    case 'USD₮0':
    case 'USDT0':
      return 'USDTugrik0';
    default:
      return symbol;
  }
};

export function getAssetDisplaySymbol(
  assetAddress: string,
  defaultSymbol: string,
  chainInformation: ChainInformation
): string {
  if (chainInformation.assetOverrides[assetAddress] !== undefined) {
    return chainInformation.assetOverrides[assetAddress].symbol;
  }
  return defaultSymbol;
}

export function getAssetDisplayName(
  assetAddress: string,
  defaultName: string,
  chainInformation: ChainInformation
): string {
  if (chainInformation.assetOverrides[assetAddress] !== undefined) {
    return chainInformation.assetOverrides[assetAddress].name;
  }
  return defaultName;
}

export function iconNameForChainId(chainId: number): string {
  switch (chainId) {
    case 1:
    case 42:
    case 11155111:
      return 'ETHEREUM';
    case 43113:
    case 43114:
      return 'AVALANCHE';
    case 137:
    case 80001:
      return 'POLYGON';
    case 10:
    case 420:
      return 'OPTIMISM-NETWORK';
    case 42161:
    case 421613:
      return 'ARBITRUM-NETWORK';
    case 8453:
    case 84531:
      return 'BASE-NETWORK';
    case 59140:
      return 'LINEA-NETWORK';
    case 534352:
      return 'SCROLL-NETWORK';
    case 5000:
      return 'MANTLE-NETWORK';
    case 59144:
      return 'LINEA-NETWORK';
    case 130:
      return 'UNICHAIN-NETWORK';
    case 2020:
      return 'RONIN-NETWORK';
    default:
      return '';
  }
}
