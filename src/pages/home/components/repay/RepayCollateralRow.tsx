import { formatUnits } from 'viem';

import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { formatToken } from '@helpers/format';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';


export const RepayCollateralRow = () => {
  const { fromAddress } = CollateralSwapContext.use();
  const { data: quoteData, isFetching } = useCollateralRepayQuote();
  const collateralAsset = useMarketCollateral(fromAddress);

  const { balance = 0n, decimals = 0, symbol = '' } = collateralAsset ?? {};

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
          <span className={`asset asset--${assetIconForAssetSymbol(symbol)} collateral-summary-asset`}></span>
          Collateral ({symbol})
        </>
      }
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : (
            <>
              <span>{formattedBalance}</span>
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
