import { UnsupportedToken } from '@components/UnsupportedToken';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useCollateralRepayBlacklist } from '@hooks/repay/useCollateralRepayBlacklist';

export const RepayUnsupportedToken = () => {
  const { fromAddress } = CollateralSwapContext.use();

  const fromCollateral = useMarketCollateral(fromAddress);

  const isCollateralBlacklisted = useCollateralRepayBlacklist(fromCollateral?.address);

  if (!isCollateralBlacklisted) {
    return null;
  }

  return (
    <UnsupportedToken
      tokens={[
        {
          symbol: fromCollateral?.symbol ?? '',
          name: fromCollateral?.name ?? ''
        }
      ]}
    />
  );
};
