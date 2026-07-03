import { useState } from 'react';
import { formatUnits } from 'viem';

import { ExchangeArrows } from '@components/Icons/ExchangeArrows';
import { PulseLoader } from '@components/PulseLoader';
import { formatToken } from '@helpers/format';

export interface ExchangeRowProps {
  title: string;
  isQuoteExists: boolean;
  fromAmount: string;
  toAmount: string;
  isFetching: boolean;
  fromDecimals: number;
  toDecimals: number;
  fromSymbol: string;
  toSymbol: string;
}

export const ActionCardExchangeRate = (props: ExchangeRowProps) => {
  const {
    title,
    isQuoteExists,
    isFetching,
    fromDecimals,
    toDecimals,
    fromSymbol,
    toSymbol,
    fromAmount,
    toAmount
  } = props;

  const [isReversed, setIsReversed] = useState(false);

  let displayRate = '0';
  let displayReverseRate = '0';

  if (fromAmount && toAmount) {
    const fromAmountBn = BigInt(fromAmount);
    const toAmountBn = BigInt(toAmount);

    if (fromAmountBn > 0n && toAmountBn > 0n) {
      const exchangeRateBn = (toAmountBn * BigInt(10 ** fromDecimals)) / fromAmountBn;
      displayRate = formatUnits(exchangeRateBn, toDecimals);

      const reverseExchangeRateBn = (fromAmountBn * BigInt(10 ** toDecimals)) / toAmountBn;
      displayReverseRate = formatUnits(reverseExchangeRateBn, fromDecimals);
    }
  }

  const handleToggleRate = () => {
    setIsReversed(prev => !prev);
  };

  return (
    <div className="exchange-wrapper">
      <p className="exchange-title label L2">
        {title}
      </p>

      <div className="exchange-content">
        {isFetching ? (
          <span className="placeholder-content" style={{ width: '84px' }} />
        ) : (
          isQuoteExists && (
            <button
              className="exchange-content-button"
              onClick={handleToggleRate}
              role="button"
              tabIndex={0}
            >
              {isReversed ? (
                <>
                  <span>1 {toSymbol}</span>
                  <ExchangeArrows />
                  <span>{formatToken(displayReverseRate)} {fromSymbol}</span>
                </>
              ) : (
                <>
                  <span>1 {fromSymbol}</span>
                  <ExchangeArrows />
                  <span>{formatToken(displayRate)} {toSymbol}</span>
                </>
              )}
            </button>
          )
        )}
        <span className="exchange-content-loader">
          {(isQuoteExists || isFetching) && <PulseLoader triggerPulse={isFetching} />}
        </span>
      </div>
    </div>
  );
};
