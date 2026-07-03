import { parseUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useCollateralSwapPositionAffect } from '@hooks/collateral-swap/useCollateralSwapPositionAffect';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useUserBorrowCapacity } from '@hooks/leveraged-position/useUserBorrowCapacity';
import { useUserDebt } from '@hooks/leveraged-position/useUserDebt';

export function useCollateralSwapInputValidation(): string | undefined {
  const { inputValue, fromAddress } = CollateralSwapContext.use();

  const { data: quoteData, isPending } = useCollateralSwapQuote();

  const collateralInfo = useMarketCollateral(fromAddress);

  const changes = useCollateralSwapPositionAffect();

  const borrowCapacityValue = useUserBorrowCapacity({
    changes: changes
  });

  const userDebtValue = useUserDebt({
    changes: changes
  });

  if (inputValue === '') return;

  const { decimals = 0, balance = 0n } = collateralInfo ?? {};

  const inputValueBn = parseUnits(inputValue, decimals);

  if (inputValueBn > balance) {
    return 'Insufficient protocol balance';
  }

  if (!isPending && !quoteData) {
    return 'No quote for this pair';
  }

  if (quoteData && borrowCapacityValue < userDebtValue) {
    return 'Debt exceeds collateralization';
  }
}
