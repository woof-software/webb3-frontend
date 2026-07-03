import { ActionCardExchangeRate } from '@components/ActionCardExchangeRate';
import MultiplierContext from '@contexts/MultiplierContext';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';


export const MultiplierExchangeRate = () => {
  const { collateral } = MultiplierContext.use();
  const { data: quoteData, isFetching } = useMultiplierQuote();

  const fromCollateral = useMarketCollateral(collateral);
  const baseAsset = useMarketBaseAsset();

  return (
    <ActionCardExchangeRate
      title="Position after multiply"
      fromAmount={quoteData?.toAmount ?? '0'}
      fromSymbol={fromCollateral?.symbol ?? ''}
      fromDecimals={fromCollateral?.decimals ?? 1}
      toAmount={quoteData?.fromAmount ?? '0'}
      toSymbol={baseAsset?.symbol ?? ''}
      toDecimals={baseAsset?.decimals ?? 1}
      isQuoteExists={!!quoteData}
      isFetching={isFetching}
    />
  );
};