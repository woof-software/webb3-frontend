import { ethers } from 'ethers';
import { Address, Hex } from 'viem';
import { useSendTransaction } from 'wagmi';

import { useMarket } from '@hooks/useMarket';

export type MultiplyApproveSignature = {
  r: string;
  s: string;
  v: number;
  nonce: bigint;
  expiry: bigint;
};

export type MultiplyTransactionArgs = {
  toContractAddress: Address; // the address of the contract with ABI listed below
  cometAddress: Address;
  swapCallData: Hex;
  loanPluginSelector: Hex;
  swapPluginSelector: Hex;
  collateralAddress: Address;
  collateralAmount: bigint;
  baseAssetAmount: bigint;
  signature?: MultiplyApproveSignature;
}

/**
 * Wrapper around `useSendTransaction` with the predefined logic
 * of the transaction building.
 *
 * @returns The hook returns a result of the `useSendTransaction` with overwritten
 *          `sendTransaction` method. Where `sendTransaction` is preconfigured to be
 *          used with appropriate arguments, ABI, etc.
 */
export function useCollateralRepayTransaction() {
  const market = useMarket();

  const { sendTransactionAsync, ...query } = useSendTransaction();

  const _sendTransaction = (args: MultiplyTransactionArgs) => {
    const {
      swapCallData,
      signature
    } = args;

    let abi: string;

    if (signature) {
      abi = 'function cover(tuple(address comet, address loanPlugin, address swapPlugin) opts, uint256 loanDebt, address collateral, uint256 collateralAmount, bytes swapData, tuple(uint256 nonce, uint256 expiry, bytes32 r, bytes32 s, uint8 v) allowParams)';
    } else {
      abi = 'function cover(tuple(address comet, address loanPlugin, address swapPlugin) opts, uint256 loanDebt, address collateral, uint256 collateralAmount, bytes swapData)';
    }

    const _interface = new ethers.utils.Interface([abi]);

    const {
      toContractAddress,
      cometAddress,
      swapPluginSelector,
      loanPluginSelector,
      collateralAddress,
      collateralAmount,
      baseAssetAmount,
    } = args;

    const paramsToEncode: unknown[] = [
      [
        cometAddress,
        loanPluginSelector,
        swapPluginSelector
      ],
      baseAssetAmount,
      collateralAddress,
      collateralAmount,
      swapCallData
    ];

    if (signature) {
      paramsToEncode.push([
        signature.nonce,
        signature.expiry,
        signature.r,
        signature.s,
        signature.v
      ]);
    }

    const encodedData = _interface.encodeFunctionData('cover', paramsToEncode);

    return sendTransactionAsync({
      to: toContractAddress,
      data: encodedData as Hex,
      chainId: market?.chainInformation.chainId
    });
  };

  return {
    sendTransactionAsync: _sendTransaction,
    ...query
  };
}
