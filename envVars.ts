// const rpcProviderHost = import.meta.env.VITE_V3_RPC_PROVIDER_HOST || 'RPC_PROVIDER_HOST_NOT_CONFIGURED';
// const walletConnectProjectId =
//   import.meta.env.VITE_V3_WALLET_CONNECT_PROJECT_ID || 'WALLET_CONNECT_PROJECT_ID_NOT_CONFIGURED';
//
// export const SEPOLIA_URL = `https://${rpcProviderHost}/ethereum-sepolia`;
// export const MAINNET_URL = `https://${rpcProviderHost}/ethereum-mainnet`;
// export const POLYGON_URL = `https://${rpcProviderHost}/polygon-mainnet`;
// export const ARBITRUM_URL = `https://${rpcProviderHost}/arbitrum-mainnet`;
// export const SCROLL_URL = 'https://rpc.scroll.io';
// export const OPTIMISM_URL = `https://${rpcProviderHost}/optimism-mainnet`;
// export const AVALANCHE_URL = `https://${rpcProviderHost}/avalanche-mainnet`;
// export const FUJI_URL = `https://${rpcProviderHost}/avalanche-fuji`;
// export const BASE_MAINNET_URL = `https://${rpcProviderHost}/base-mainnet`;
// export const WALLECT_CONNECT_PROJECT_ID = walletConnectProjectId;
// export const MANTLE_URL = `https://${rpcProviderHost}/mantle-mainnet`;
// export const LINEA_URL = `https://${rpcProviderHost}/linea-mainnet`;
// export const UNICHAIN_URL = `https://${rpcProviderHost}/unichain-mainnet`;
// export const RONIN_URL = `https://${rpcProviderHost}/ronin-mainnet`;
//
// Dont remove
const screeningEndpoint = import.meta.env.VITE_SCREENING_ENDPOINT || 'SCREENING_ENDPOINT_NOT_CONFIGURED';
export const SCREENING_URL = screeningEndpoint;

const walletConnectProjectId =
  import.meta.env.VITE_V3_WALLET_CONNECT_PROJECT_ID || 'WALLET_CONNECT_PROJECT_ID_NOT_CONFIGURED';

export const WALLECT_CONNECT_PROJECT_ID = walletConnectProjectId;

export const SEPOLIA_URL = `https://rpc.ankr.com/eth_sepolia/${import.meta.env.VITE_ANKR_KEY}`;
export const MAINNET_URL = `https://rpc.ankr.com/eth/${import.meta.env.VITE_ANKR_KEY}`;
export const POLYGON_URL = `https://rpc.ankr.com/polygon/${import.meta.env.VITE_ANKR_KEY}`;
export const ARBITRUM_URL = `https://rpc.ankr.com/arbitrum/${import.meta.env.VITE_ANKR_KEY}`;
export const SCROLL_URL = `https://rpc.ankr.com/scroll/${import.meta.env.VITE_ANKR_KEY}`;
export const OPTIMISM_URL = `https://rpc.ankr.com/optimism/${import.meta.env.VITE_ANKR_KEY}`;
export const AVALANCHE_URL = `https://rpc.ankr.com/avalanche/${import.meta.env.VITE_ANKR_KEY}`;
export const FUJI_URL = `https://rpc.ankr.com/avalanche_fuji/${import.meta.env.VITE_ANKR_KEY}`;
export const BASE_MAINNET_URL = `https://rpc.ankr.com/base/${import.meta.env.VITE_ANKR_KEY}`;
export const MANTLE_URL = `https://rpc.ankr.com/mantle/${import.meta.env.VITE_ANKR_KEY}`;
export const LINEA_URL = `https://rpc.ankr.com/linea/${import.meta.env.VITE_ANKR_KEY}`;
export const UNICHAIN_URL = `https://rpc.ankr.com/unichain/${import.meta.env.VITE_ANKR_KEY}`;
export const RONIN_URL = `https://rpc.ankr.com/ronin/${import.meta.env.VITE_ANKR_KEY}`;

