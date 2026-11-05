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
  chainInformation: ChainInformation,
): string {
  if (chainInformation.assetOverrides[assetAddress] !== undefined) {
    return chainInformation.assetOverrides[assetAddress].symbol;
  }
  return defaultSymbol;
}

export function getAssetDisplayName(
  assetAddress: string,
  defaultName: string,
  chainInformation: ChainInformation,
): string {
  if (chainInformation.assetOverrides[assetAddress] !== undefined) {
    return chainInformation.assetOverrides[assetAddress].name;
  }
  return defaultName;
}

export function iconNameForChainId(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'ETHEREUM';
    case 137:
      return 'POLYGON';
    case 10:
      return 'OPTIMISM-NETWORK';
    case 42161:
      return 'ARBITRUM-NETWORK';
    case 8453:
      return 'BASE-NETWORK';
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

// Whenever we add an icon in _asset.scss, also add it to this array
export const hasAssetIcon = (symbol: string): boolean => {
  const ICONS = [
    'AAVE',
    'cbETH',
    'cbBTC',
    'COMPOUND',
    'FEI',
    'BAT',
    'COMP',
    'DAI',
    'ETH',
    'WETH',
    'ETHEREUM',
    'INSTITUTIONAL',
    'LINK',
    'LIQUIDATE',
    'MKR',
    'REP',
    'rETH',
    'rsETH',
    'osETH',
    'ezETH',
    'SAI',
    'stETH',
    'weETH',
    'wstETH',
    'SUSHI',
    'UNSUPPORTED',
    'TUSD',
    'UNI',
    'USDC',
    'USDC.e',
    'USDP',
    'USDT',
    'WBTC',
    'WBTC2',
    'YFI',
    'ZRX',
    'V2',
    'POLYGON',
    'POL',
    'MATICX',
    'stMATIC',
    'WMATIC',
    'OPTIMISM',
    'ARBITRUM',
    'SCROLL',
    'wrsETH',
    'rswETH',
    'tBTC',
    'AERO',
    'USDS',
    'USDe',
    'sFRAX',
    'ETHx',
    'wUSDM',
    'mETH',
    'FBTC',
    'sUSDS',
    'LBTC',
    'PUMPBTC',
    'tETH',
    'AXS',
    'RON',
    'wsuperOETHb',
    'USD₮0',
    'SKY',
    'WRON',
    'sdeUSD',
    'deUSD',
    'pufETH',
    'wOETH',
    'XAUt',
  ];
  return ICONS.includes(symbol);
};
