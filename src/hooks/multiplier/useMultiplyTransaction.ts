import { ethers } from 'ethers';
import { Address, Hex } from 'viem';
import { useChainId, useSendTransaction } from 'wagmi';

import { CHAINS } from '@constants/chains';
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
  baseAssetAmount: bigint;
  collateralAmount: bigint; // the plain value specified by the user through the supply input (without multiplication applied)
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
export function useMultiplyTransaction() {
  const market = useMarket();

  const chainId = useChainId();

  const { sendTransactionAsync, ...query } = useSendTransaction();

  const _sendTransaction = (args: MultiplyTransactionArgs) => {
    const {
      swapCallData,
      signature
    } = args;

    let abi: string;

    if (signature) {
      abi = 'function multiply(tuple(address comet, address loanPlugin, address swapPlugin) opts, address collateral, uint256 collateralAmount, uint256 baseAmount, uint256 maxHealthFactorDrop, bytes swapData, tuple(uint256 nonce, uint256 expiry, bytes32 r, bytes32 s, uint8 v) allowParams) payable';
    } else {
      abi = 'function multiply(tuple(address comet, address loanPlugin, address swapPlugin) opts, address collateral, uint256 collateralAmount, uint256 baseAmount, uint256 maxHealthFactorDrop, bytes swapData) payable';
    }

    const _interface = new ethers.utils.Interface([abi]);

    const {
      toContractAddress,
      cometAddress,
      swapPluginSelector,
      loanPluginSelector,
      baseAssetAmount,
      collateralAmount,
      collateralAddress
    } = args;

    const paramsToEncode: unknown[] = [
      [
        cometAddress,
        loanPluginSelector,
        swapPluginSelector
      ],
      collateralAddress,
      collateralAmount,
      baseAssetAmount,
      1,
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

    const encodedData = _interface.encodeFunctionData('multiply', paramsToEncode);

    let value = 0n;

    const localOverride = CHAINS[chainId]?.assetOverrides?.[collateralAddress];

    if (localOverride?.address === ethers.constants.AddressZero) {
      value = collateralAmount;
    }

    return sendTransactionAsync({
      to: toContractAddress,
      data: encodedData as Hex,
      value: value,
      chainId: market?.chainInformation.chainId
    });
  };

  return {
    sendTransactionAsync: _sendTransaction,
    ...query
  };
}