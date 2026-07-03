import { ActionCardRow } from '@components/ActionCardRow';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';

export const MultiplierFlashLoanRow = () => {
  const { data: flashLoan, isFetching } = useMarketFlashLoan();

  return (
    <ActionCardRow
      title="FlashLoan fee"
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : `${flashLoan?.fee ?? 0}%`
      }
    />
  );
};