import { ActionCardRow } from '@components/ActionCardRow';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

export const MultiplierSwapRow = () => {
  const { data: quoteData, isFetching } = useMultiplierQuote();
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
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : displayTool ?? '-'
      }
    />
  );
};