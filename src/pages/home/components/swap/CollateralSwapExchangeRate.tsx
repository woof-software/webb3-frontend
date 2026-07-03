import { ActionCardExchangeRate } from '@components/ActionCardExchangeRate';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';

export const CollateralSwapExchangeRate = () => {
  const { fromAddress, toAddress } = CollateralSwapContext.use();
  const { data: quoteData, isFetching } = useCollateralSwapQuote();

  const fromCollateral = useMarketCollateral(fromAddress);
  const toCollateral = useMarketCollateral(toAddress);

  return (
    <ActionCardExchangeRate
      title="Supply balance after swap"
      fromAmount={quoteData?.fromAmount ?? '0'}
      fromSymbol={fromCollateral?.symbol ?? ''}
      fromDecimals={fromCollateral?.decimals ?? 1}
      toAmount={quoteData?.toAmount ?? '0'}
      toSymbol={toCollateral?.symbol ?? ''}
      toDecimals={toCollateral?.decimals ?? 1}
      isQuoteExists={!!quoteData}
      isFetching={isFetching}
    />
  );
};
