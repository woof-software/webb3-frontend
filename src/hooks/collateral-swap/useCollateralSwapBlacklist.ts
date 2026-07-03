import { LEVERAGE_BLACKLIST } from '@constants/leverage-blacklist';
import { useMarket } from '@hooks/useMarket';

export const useCollateralRepayBlacklist = (direction: 'from' | 'to', address?: string) => {
  const market = useMarket();

  if (!market || !address) return false;

  const chainId = market.chainInformation.chainId;

  const token = LEVERAGE_BLACKLIST[chainId]?.[address];

  if (!token) return false;

  return token.swap[direction];
};
