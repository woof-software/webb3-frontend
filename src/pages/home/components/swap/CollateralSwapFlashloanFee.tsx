import { ActionCardRow } from '@components/ActionCardRow';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';

export const CollateralSwapFlashloanFee = () => {
  const { data: marketFlashloan, isFetching } = useMarketFlashLoan();

  return (
    <ActionCardRow
      title="FlashLoan fee"
      info={(
        <>
          {isFetching && <span className="placeholder-content" style={{ width: '84px' }} />}
          {!isFetching && <span>{marketFlashloan?.fee !== undefined ? `${marketFlashloan?.fee}%` : '-'}</span>}
        </>
      )}
    />
  )
};