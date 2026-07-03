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
  fromTokenAddress: Address;
  toTokenAddress: Address;
  fromTokenAmount: bigint; // the plain value specified by the user through the supply input (without multiplication applied)
  toTokenAmount: bigint;
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
export function useCollateralSwapTransaction() {
  const market = useMarket();

  const { sendTransactionAsync, ...query } = useSendTransaction();

  const _sendTransaction = (args: MultiplyTransactionArgs) => {
    const {
      swapCallData,
      signature
    } = args;

    let abi: string;

    if (signature) {
      abi = 'function exchange(tuple(address comet, address loanPlugin, address swapPlugin) opts, address fromAsset, address toAsset, uint256 fromAmount, uint256 minAmountOut, uint256 maxHealthFactorDrop, bytes swapData, tuple(uint256 nonce, uint256 expiry, bytes32 r, bytes32 s, uint8 v) allowParams)';
    } else {
      abi = 'function exchange(tuple(address comet, address loanPlugin, address swapPlugin) opts, address fromAsset, address toAsset, uint256 fromAmount, uint256 minAmountOut, uint256 maxHealthFactorDrop, bytes swapData)';
    }

    const _interface = new ethers.utils.Interface([abi]);

    const {
      toContractAddress,
      cometAddress,
      swapPluginSelector,
      loanPluginSelector,
      toTokenAddress,
      fromTokenAddress,
      fromTokenAmount,
      toTokenAmount
    } = args;

    const paramsToEncode: unknown[] = [
      [
        cometAddress,
        loanPluginSelector,
        swapPluginSelector
      ],
      fromTokenAddress,
      toTokenAddress,
      fromTokenAmount,
      toTokenAmount,
      9999n,
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

    const encodedData = _interface.encodeFunctionData('exchange', paramsToEncode);

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
