import { UnsupportedToken } from '@components/UnsupportedToken';
import MultiplierContext from '@contexts/MultiplierContext';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMultiplierBlacklist } from '@hooks/multiplier/usMultiplierBlacklist';

export const MultiplierUnsupportedToken = () => {
  const { collateral } = MultiplierContext.use();

  const fromCollateral = useMarketCollateral(collateral);
  
  const isCollateralBlacklisted = useMultiplierBlacklist(collateral ?? undefined);
  
  if (!isCollateralBlacklisted) {
    return null;
  }

  return (
    <UnsupportedToken
      tokens={[{
        symbol: fromCollateral?.symbol ?? '',
        name: fromCollateral?.name ?? ''
      }]}
    />
  );
};
