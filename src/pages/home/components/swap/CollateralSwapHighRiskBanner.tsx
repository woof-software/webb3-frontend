import { WarningAlert } from '@components/WarningAlert';
import { useCollateralSwapPositionAffect } from '@hooks/collateral-swap/useCollateralSwapPositionAffect';
import { useUserLtv } from '@hooks/leveraged-position/useUserLtv';

export const CollateralSwapHighRiskAlert = () => {
  const changes = useCollateralSwapPositionAffect();

  const ltvAfter = useUserLtv({ changes: changes });

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
