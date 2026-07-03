import { ActionCardRow } from '@components/ActionCardRow';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';

export const CollateralSwapActionCardSwapRow = () => {
  const { data: quoteData, isFetching } = useCollateralSwapQuote();
  let displayTool = null;

  if (quoteData) {
    displayTool = quoteData.tool.length > 1
      ? quoteData.tool.split(',')[0]
      : quoteData.tool;
  }

  return (
    <ActionCardRow
      title={'Swap route'}
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }} />
          : displayTool ?? '-'
      }
    />
  );
};
