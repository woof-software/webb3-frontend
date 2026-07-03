import { WarningAlert } from '@components/WarningAlert';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';

export const CollateralSwapSlippageLowAlert = () => {
  const { data: quote } = useCollateralSwapQuote();

  const { slippagePercent, setSlippagePercent } = CollateralSwapContext.use();

  const { priceImpactPercent = 0 } = quote ?? {};

  const desiredSlippage = Math.max(priceImpactPercent * -1, 0);

  if (desiredSlippage <= +slippagePercent || +slippagePercent <= 0) {
    return null;
  }

  const slippageWithBuffer = +(desiredSlippage + 0.1).toFixed(2);

  const onClickBySlippage = () => {
    setSlippagePercent(`${Math.max(+slippagePercent, slippageWithBuffer)}`);
  };

  return (
    <WarningAlert className={'collateral-slippage-low-slippage-alert'}>
      <span>Your slippage tolerance is lower than the expected slippage. To reduce this risk, set the slippage to at least </span>
      <button
        onClick={onClickBySlippage}
      >{slippageWithBuffer}</button>
    </WarningAlert>
  );
};
