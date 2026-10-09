import { useContext } from 'react';
import { useLocation } from 'react-router';

import { getSelectedMarketContext } from '@contexts/SelectedMarketContext';
import type { Web3 } from '@contexts/Web3Context';
import { MARKETS } from '@helpers/markets';

export type AlertBannerProps = {
  web3: Web3;
  isCometStateError: boolean;
  isMarketsStateError: boolean;
};

const AlertBanner = ({ web3, isCometStateError, isMarketsStateError }: AlertBannerProps) => {
  const location = useLocation();

  const { isSelectedMarketError } = useContext(getSelectedMarketContext());

  const isHomePage = location.pathname === '/';

  const isMarketPage = /^\/markets\/[^/]+/.test(location.pathname);

  const isMarketDataError =
    (isHomePage && (isSelectedMarketError || isCometStateError)) ||
    (isMarketPage && (isSelectedMarketError || isMarketsStateError));

  const messages: string[] = [];
  if (web3.write.chainId && !isSupportedNetwork(web3.write.chainId)) {
    messages.push('Compound III is not supported on this network. Please switch to a supported network.');
  }

  if (isMarketDataError) {
    messages.push('Market data is currently unavailable. Please try again later or select another market.');
  }

  const hideBannerClass = messages.length === 0 ? '--hide' : '';

  return (
    <div className={`alert-banner${hideBannerClass}`}>
      {messages.map((message) => (
        <div key={message} className="message">
          {message}
        </div>
      ))}
    </div>
  );
};

function isSupportedNetwork(chainId: number): boolean {
  const marketForChainId = MARKETS.find((market) => market.chainInformation.chainId === chainId);
  return marketForChainId !== undefined;
}

export default AlertBanner;
