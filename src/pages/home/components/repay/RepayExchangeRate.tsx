import { ActionCardExchangeRate } from '@components/ActionCardExchangeRate';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const RepayExchangeRate = () => {
  const { fromAddress } = CollateralSwapContext.use();
  const { data: quoteData, isFetching } = useCollateralRepayQuote();

  const fromCollateral = useMarketCollateral(fromAddress);
  const baseAsset = useMarketBaseAsset();

  return (
    <ActionCardExchangeRate
      title="Position balance after repay"
      fromAmount={quoteData?.fromAmount ?? '0'}
      fromSymbol={fromCollateral?.symbol ?? ''}
      fromDecimals={fromCollateral?.decimals ?? 1}
      toAmount={quoteData?.toAmount ?? '0'}
      toSymbol={baseAsset?.symbol ?? ''}
      toDecimals={baseAsset?.decimals ?? 1}
      isQuoteExists={!!quoteData}
      isFetching={isFetching}
    />
  );
};
