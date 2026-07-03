import { ActionCardRow } from '@components/ActionCardRow';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';

export const CollateralSwapCompoundFee = () => {
  const { isFetching } = useCollateralSwapQuote();

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