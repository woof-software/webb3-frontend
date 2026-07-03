import { UnsupportedToken, UnsupportedTokenRecord } from '@components/UnsupportedToken';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralRepayBlacklist } from '@hooks/collateral-swap/useCollateralSwapBlacklist';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';

export const CollateralSwapUnsupportedToken = () => {
  const { fromAddress, toAddress } = CollateralSwapContext.use();

  const fromCollateral = useMarketCollateral(fromAddress);
  const toCollateral = useMarketCollateral(toAddress);

  const isFromCollateralBlacklisted = useCollateralRepayBlacklist('from', fromAddress);
  const isToCollateralBlacklisted = useCollateralRepayBlacklist('to', toAddress);

  const tokens: UnsupportedTokenRecord[] = [];

  if (isFromCollateralBlacklisted) {
    tokens.push({
      symbol: fromCollateral?.symbol ?? '',
      name: fromCollateral?.name ?? ''
    });
  }

  if (isToCollateralBlacklisted) {
    tokens.push({
      symbol: toCollateral?.symbol ?? '',
      name: toCollateral?.name ?? ''
    });
  }

  if (!tokens.length) {
    return null;
  }

  return <UnsupportedToken tokens={tokens} />;
};
