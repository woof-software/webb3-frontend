import { WarningAlert } from '@components/WarningAlert';
import { useUserLtv } from '@hooks/leveraged-position/useUserLtv';
import { useCollateralRepayPositionAffect } from '@hooks/repay/useCollateralRepayPositionAffect';

export const RepayHighRiskAlert = () => {
  const changes = useCollateralRepayPositionAffect();

  const ltvAfter = useUserLtv({ changes });

  if (ltvAfter < 80) {
    return null;
  }

  return (
    <WarningAlert>
      Borrowing this amount will lower your Health Factor and increase your liquidation risk. By proceeding, you
      acknowledge and accept these risks.
    </WarningAlert>
  );
};
