import { MouseEvent } from 'react';
import { formatUnits } from 'viem';

import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { formatValue } from '@helpers/numbers';
import { abs } from '@helpers/numeric';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import {
  useCollateralRepayInputValidation
} from '@hooks/repay/useCollateralRepayInputValidation';

import CollateralSwapInput from '../swap/CollateralSwapInput';

export interface RepayInputProps {
  onHelpClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const RepayInput = (props: RepayInputProps) => {
  const { onHelpClick } = props;

  const { inputValue, setInputValue, toAddress } = CollateralSwapContext.use();
  const baseAsset = useMarketBaseAsset();

  const {
    address: baseAssetAddress = '',
    symbol = '',
    decimals = 1,
    balance = 0n
  } = baseAsset ?? {};

  const isBaseAssetOnSwap = toAddress === baseAssetAddress;

  const error = useCollateralRepayInputValidation();

  const onMaxClick = () => {
    setInputValue(`${Math.abs(+formatUnits(balance, decimals))}`);
  };

  const formattedBalance = formatValue(decimals, abs(balance));

  return (
    <CollateralSwapInput
      onHelpClick={onHelpClick}
      onMaxClick={onMaxClick}
      availablePrefix={formattedBalance}
      symbol={symbol}
      value={inputValue}
      onChange={setInputValue}
      error={error}
      isBaseAssetOnSwap={isBaseAssetOnSwap}
      inputLabel={'Repay'}
    />
  );
};
