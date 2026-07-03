import { parseUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useUserBorrowCapacity } from '@hooks/leveraged-position/useUserBorrowCapacity';
import { useUserDebt } from '@hooks/leveraged-position/useUserDebt';
import { useCollateralRepayPositionAffect } from '@hooks/repay/useCollateralRepayPositionAffect';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const useCollateralRepayInputValidation = () => {
  const { inputValue, fromAddress } = CollateralSwapContext.use();

  const { data: quoteData, isPending } = useCollateralRepayQuote();

  const baseAsset = useMarketBaseAsset();

  const collateral = useMarketCollateral(fromAddress);

  const changes = useCollateralRepayPositionAffect();

  const borrowCapacityValue = useUserBorrowCapacity({
    changes: changes
  });

  const userDebtValue = useUserDebt({
    changes: changes
  });

  const { balance = 0n, decimals = 1 } = baseAsset ?? {};
  const { balance: collateralBalance = 0n } = collateral ?? {};

  const inputValueBn = parseUnits(inputValue, decimals);

  if (!inputValueBn) {
    return;
  }

  if (!isPending && !quoteData) {
    return 'No quote for this pair';
  }

  if (inputValueBn > (balance * -1n)) {
    return 'Amount exceeds available loan';
  }

  if (quoteData && BigInt(quoteData.fromAmount) > collateralBalance) {
    return 'Insufficient collateral balance';
  }

  if (quoteData && borrowCapacityValue < userDebtValue) {
    return 'Debt exceeds collateralization';
  }
};
