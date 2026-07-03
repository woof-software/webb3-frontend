import { formatUnits } from 'viem';

import { ArrowDown, ArrowUp } from '@components/Icons';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { formatToken } from '@helpers/format';
import { usdBalanceFormatter } from '@helpers/numbers';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';

export const CollateralSwapActionCardAssets = () => {
  const { fromAddress, toAddress } = CollateralSwapContext.use();
  const { data: quoteData, isFetching } = useCollateralSwapQuote();

  const fromCollateral = useMarketCollateral(fromAddress);
  const toCollateral = useMarketCollateral(toAddress);
  const baseAsset = useMarketBaseAsset();

  const {
    symbol: baseSymbol = '',
    baseAssetPriceInDollars: baseAssetPriceInDollars = 0n
  } = baseAsset ?? {};

  const {
    decimals: fromDecimals = 1,
    symbol: fromSymbol = '',
    balance: fromBalance = 0n,
    price: fromPrice = 0n
  } = fromCollateral ?? {};

  const {
    decimals: toDecimals = 1,
    symbol: toSymbol = '',
    balance: toBalance = 0n,
    price: toPrice = 0n
  } = toCollateral ?? {};


  let displayFromBalance = formatUnits(fromBalance, fromDecimals);
  let displayToBalance = formatUnits(toBalance, toDecimals);

  const fromBalanceUsdBefore = fromBalance;
  let fromBalanceUsdAfter = fromBalance;

  const toBalanceUsdBefore = toBalance;
  let toBalanceUsdAfter = toBalance;

  if (quoteData) {
    const fromAmountAsBn = BigInt(quoteData?.fromAmount ?? 0n);
    const fromBalanceAfter = +formatUnits(fromBalance - fromAmountAsBn, fromDecimals);
    displayFromBalance = `${Math.max(fromBalanceAfter, 0)}`;

    const toAmountAsBn = BigInt(quoteData?.toAmount ?? 0n);
    const toBalanceAfter = +formatUnits(toBalance + toAmountAsBn, toDecimals);
    displayToBalance = `${Math.max(toBalanceAfter, 0)}`;

    fromBalanceUsdAfter = fromBalance - fromAmountAsBn;
    toBalanceUsdAfter = toBalance + toAmountAsBn;
  }

  const fromBalanceUsdDifference = fromBalanceUsdAfter - fromBalanceUsdBefore;
  const toBalanceUsdDifference = toBalanceUsdAfter - toBalanceUsdBefore;

  const displayFromBalanceUsd = usdBalanceFormatter(fromBalanceUsdAfter, fromPrice, fromDecimals, baseAssetPriceInDollars, baseSymbol);
  const displayToBalanceUsd = usdBalanceFormatter(toBalanceUsdAfter, toPrice, toDecimals, baseAssetPriceInDollars, baseSymbol);

  const getArrowDirection = (difference: bigint) => {
    if (difference > 0) return (
      <ArrowUp key="arrow-up" className="collateral-swap-action-card-summary__compare-row-arrow" />
    );

    if (difference < 0) return (
      <ArrowDown key="arrow-down" className="collateral-swap-action-card-summary__compare-row-arrow" />
    );
  };

  return (
    <div className="collateral-swap-action-card-summary__compare-row-tokens-row">
      <div className="collateral-swap-action-card-summary__compare-row-token">
        {isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }} />
          : (
            <span className="collateral-swap-action-card-summary__compare-row-token-amount">
              <span className={`asset asset--${assetIconForAssetSymbol(fromSymbol || baseSymbol)}`} />
              {formatToken(displayFromBalance)}
            </span>
          )
        }
        {isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }} />
          : (
            <span className="collateral-swap-action-card-summary__compare-row-token-usd">
              {getArrowDirection(fromBalanceUsdDifference)}{displayFromBalanceUsd}
            </span>
          )
        }
      </div>
      <div className="collateral-swap-action-card-summary__compare-row-token">
        {isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }} />
          : (
            <span className="collateral-swap-action-card-summary__compare-row-token-amount">
              <span className={`asset asset--${assetIconForAssetSymbol(toSymbol || baseSymbol)}`} />
              {formatToken(displayToBalance)}
            </span>
          )
        }
        {isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }} />
          : (
            <span className="collateral-swap-action-card-summary__compare-row-token-usd collateral-swap-action-card-summary__compare-row-token-usd--right">
              {getArrowDirection(toBalanceUsdDifference)}{displayToBalanceUsd}
            </span>
          )
        }
      </div>
    </div>
  );
};
