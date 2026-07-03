import { ActionCardRow } from '@components/ActionCardRow';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const RepaySwapRow = () => {
  const { data: quoteData, isFetching } = useCollateralRepayQuote();
  let displayTool = null;

  if (quoteData) {
    displayTool = quoteData.tool.length > 1
      ? quoteData.tool.split(',')[0]
      : quoteData.tool;
  }

  return (
    <ActionCardRow
      title={'Swap route'}
      info={isFetching ? <span className="placeholder-content" style={{ width: '84px' }} /> : displayTool ?? '-'}
    />
  );
};
