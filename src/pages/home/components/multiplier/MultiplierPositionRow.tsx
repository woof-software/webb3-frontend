import { formatUnits } from 'viem';

import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { formatToken } from '@helpers/format';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

export const MultiplierPositionRow = () => {
  const { data: quoteData, isFetching } = useMultiplierQuote();

  const baseAsset = useMarketBaseAsset();

  const { balance = 0n, decimals = 0, symbol = '' } = baseAsset ?? {};

  let newBalanceBn = balance;

  if (quoteData) {
    newBalanceBn = balance - BigInt(quoteData.fromAmount);
  }

  const toPositiveBalance = Math.abs(Number(formatUnits(balance, decimals)));
  const toPositiveNewBalance = Math.abs(Number(formatUnits(newBalanceBn, decimals)));

  const formattedBalance = formatToken(toPositiveBalance.toString(), 'compact');
  const formattedNewBalance = formatToken(toPositiveNewBalance.toString(), 'compact');

  return (
    <ActionCardRow
      title={
        <>
          <span className={`asset asset--${assetIconForAssetSymbol(symbol)} multiplier-summary-asset`}></span>
          <span>
           {newBalanceBn > 0n ? 'Supply' : 'Loan'} ({symbol})
          </span>
        </>
      }
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : (
            <>
              <span>{balance > 0 && newBalanceBn < 0 ? '0' : formattedBalance}</span>
              {formattedBalance !== formattedNewBalance && (
                <>
                  <span><ArrowRight className={'multiplier-action-card-summary__row-arrow'} /></span>
                  <span>{formattedNewBalance}</span>
                </>
              )}
            </>
          )
      }
    />
  );
};
