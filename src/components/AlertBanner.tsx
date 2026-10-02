import { useMarketsContext } from '@contexts/MarketsContext';
import type { Web3 } from '@contexts/Web3Context';
import { MarketData } from '@types';

export type AlertBannerProps = {
  web3: Web3;
};

const AlertBanner = ({ web3 }: AlertBannerProps) => {
  const { markets, isLoading } = useMarketsContext();
  // Until the registry loads every network would look unsupported
  const hideBanner = isLoading || (web3.write.chainId ? isSupportedNetwork(markets, web3.write.chainId) : true);
  const hideBannerClass = hideBanner ? '--hide' : '';

  return (
    <div className={`alert-banner${hideBannerClass}`}>
      <div className="message">
        Compound III is not supported on this network. Please switch to a supported network.
      </div>
    </div>
  );
};

function isSupportedNetwork(markets: MarketData[], chainId: number): boolean {
  const marketForChainId = markets.find((market) => market.chainInformation.chainId === chainId);
  return marketForChainId !== undefined;
}

export default AlertBanner;
