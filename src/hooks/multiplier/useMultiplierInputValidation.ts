import { parseUnits } from 'viem';

import MultiplierContext from '@contexts/MultiplierContext';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useUserBorrowCapacity } from '@hooks/leveraged-position/useUserBorrowCapacity';
import { useUserDebt } from '@hooks/leveraged-position/useUserDebt';
import { useMultiplierEffect } from '@hooks/multiplier/useMultiplierEffect';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

export const useMultiplierInputValidation = () => {
  const { data: quoteData, isPending: isQuoteLoading } = useMultiplierQuote();

  const baseAsset = useMarketBaseAsset();

  const { collateral, supply } = MultiplierContext.use();

  const collateralInfo = useMarketCollateral(collateral);

  const changes = useMultiplierEffect();

  const borrowCapacityValue = useUserBorrowCapacity({
    changes: changes,
  });

  const userDebtValue = useUserDebt({
    changes: changes,
  });

  const {
    decimals: collateralDecimals = 0,
    walletBalance: collateralWalletBalance = 0n,
    supplyCap = 0n
  } = collateralInfo ?? {};
  const { toAmount = '0' } = quoteData ?? {};

  if (!supply) return;
  // format supply to BN
  const supplyBn = parseUnits(supply, collateralDecimals);

  // Insufficient balance error
  if (supplyBn > collateralWalletBalance) {
    return 'Insufficient balance';
  }

  // Supply cap error
  if (BigInt(toAmount) > supplyCap) {
    return `Supply overflow`;
  }

  // Quote is not found error
  if (!isQuoteLoading && !quoteData) {
    return 'No quote for this pair';
  }

  // Your loan becomes too small an error
  if (quoteData && baseAsset) {
    const { balance, minBorrow } = baseAsset;
    const { fromAmount } = quoteData;

    const newBalance = balance - BigInt(fromAmount);

    if (newBalance < 0n && newBalance > -minBorrow) {
      return 'Your loan becomes too small';
    }
  }

  // Insufficient base asset on the market
  if (quoteData && baseAsset) {
    const { balance, balanceOfComet } = baseAsset;
    const { fromAmount } = quoteData;

    const newBalance = (balance - BigInt(fromAmount));

    if (newBalance < 0n && newBalance * -1n > balanceOfComet) {
      return 'Insufficient base asset on the market';
    }
  }

  if (quoteData && borrowCapacityValue < userDebtValue) {
    return 'Debt exceeds collateralization';
  }
};
