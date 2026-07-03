import { ActionCardRow } from '@components/ActionCardRow';
import MultiplierContext from '@contexts/MultiplierContext';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

export const MultiplierCompoundFeeRow = () => {
  const { isFetching } = useMultiplierQuote();

  const { platformFee } = MultiplierContext.use();

  return (
    <ActionCardRow
      title="Compound fee"
      info={(
        <>
          {isFetching && <span className="placeholder-content" style={{ width: '84px' }} />}
          {!isFetching && <span>{platformFee !== undefined ? `${platformFee}%` : '-'}</span>}
        </>
      )}
    />
  )
};