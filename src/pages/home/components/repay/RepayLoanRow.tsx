import { formatUnits } from 'viem';

import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { formatToken } from '@helpers/format';
import { min } from '@helpers/numeric';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const RepayLoanRow = () => {
  const { data: quoteData, isFetching } = useCollateralRepayQuote();

  const baseAsset = useMarketBaseAsset();

  const { balance = 0n, decimals = 0, symbol = '' } = baseAsset ?? {};

  let newBalanceBn = balance;

  if (quoteData) {
    newBalanceBn = min(0n, balance + BigInt(quoteData.toAmount));
  }

  const toPositiveBalance = Math.abs(Number(formatUnits(balance, decimals)));
  const toPositiveNewBalance = Math.abs(Number(formatUnits(newBalanceBn, decimals)));

  const formattedBalance = formatToken(toPositiveBalance.toString(), 'compact');
  const formattedNewBalance = formatToken(toPositiveNewBalance.toString(), 'compact');

  return (
    <ActionCardRow
      title={
        <>
          <span className={`asset asset--${assetIconForAssetSymbol(symbol)} collateral-summary-asset`}></span>
          <span>
           Loan ({symbol})
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
                  <ArrowRight />
                  <span>{formattedNewBalance}</span>
                </>
              )}
            </>
          )
      }
    />
  );
};