import { formatUnits, parseUnits } from 'viem';

import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import MultiplierContext from '@contexts/MultiplierContext';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { formatToken } from '@helpers/format';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';


export const MultiplierCollateralRow = () => {
  const { collateral, supply } = MultiplierContext.use();
  const { data: quoteData, isFetching } = useMultiplierQuote();
  const collateralAsset = useMarketCollateral(collateral);

  const { balance = 0n, decimals = 0, symbol = '' } = collateralAsset ?? {};

  let newBalanceBn = balance;

  if (quoteData) {
    newBalanceBn = balance + BigInt(quoteData.toAmount) + parseUnits(supply, decimals);
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
          Collateral ({symbol})
        </>
      }
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : <>
            <span>{formattedBalance}</span>
            {formattedBalance !== formattedNewBalance &&
              <>
                <span><ArrowRight className={'multiplier-action-card-summary__row-arrow'} /></span>
                <span>{formattedNewBalance}</span>
              </>
            }
          </>
      }
    />
  );
};