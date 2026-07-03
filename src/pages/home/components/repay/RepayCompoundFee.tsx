import { ActionCardRow } from '@components/ActionCardRow';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const RepayCompoundFee = () => {
  const { isFetching } = useCollateralRepayQuote();

  const { platformFee } = CollateralSwapContext.use();

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