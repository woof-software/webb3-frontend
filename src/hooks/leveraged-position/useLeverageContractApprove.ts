import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { Address, isAddress } from 'viem';
import { useAccount, useReadContract, useSignTypedData } from 'wagmi';

import CometAbi from '@helpers/abis/Comet';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useMarket } from '@hooks/useMarket';
import { useMarketNonce } from '@hooks/useMarketNonce';

export type MultiplierSignature = {
  r: string;
  s: string;
  v: number;
  nonce: bigint;
  expiry: bigint;
}

/**
 * A custom hook that facilitates the approval of a multiplier allowance by generating
 * a signed typed data authorization message. It interacts with the market and multiplier
 * contract to approve the allowance for a defined time duration.
 *
 * @param expire - The duration (in milliseconds) after which the approval expires.
 * @returns - Returns a mutation object
 * for handling the approval signature. The mutation function generates an authorization signature
 * which comprises the r, s, v components along with the nonce and expiry information.
 *
 * Internal behavior:
 * - Fetches the market details and multiplier contract address.
 * - Reads necessary data such as contract name, version, and the user's wallet address.
 * - Obtains the current multiplier nonce for ensuring the uniqueness of the transaction.
 * - Signs the typed data using the user's private key and the configured domain and message types.
 * - Returns the mutation object that can be invoked to generate the authorization.
 *
 * Constraints:
 * - Ensures all addresses are valid Ethereum addresses before proceeding.
 * - Verifies the existence and types of required values like name, version, and nonce.
 * - Relies on hooks such as `useMarket`, `useMultiplierContract`, `useAccount`, `useReadContract`,
 *   and `useSignTypedData` for dependent functionality.
 */

/**
 * The hook solves the next problems:
 *  - The user must approve the allowance for the multiplier contract to manipulate the user balance.
 *  - The code should store an approval signature together with used nonce and expiry.
 *
 * Internal behavior:
 *  - Fetches the market details and multiplier contract address.
 *  - Reads necessary data such as contract name, version, and the user's wallet address.
 * - Obtains the current multiplier nonce for ensuring the uniqueness of the transaction.
 * - Signs the typed data using the user's private key and the configured domain and message types.
 * - Returns the mutation object that can be invoked to generate the authorization.
 */
export const useLeverageContractApprove = (expire: number) => {
  const market = useMarket();

  const multiplierAddress = useLeverageContractAddress();

  const cometAddress = market?.marketAddress;
  const chainId = market?.chainInformation.chainId;

  const { data: cometName } = useReadContract({
    address: cometAddress as Address,
    abi: CometAbi,
    chainId: chainId,
    functionName: 'name'
  });

  const { data: cometVersion } = useReadContract({
    address: cometAddress as Address,
    abi: CometAbi,
    chainId: chainId,
    functionName: 'version'
  });

  const {
    address: userWalletAddress
  } = useAccount();

  const { data: currentMultiplierNonce } = useMarketNonce(userWalletAddress);

  const { signTypedDataAsync } = useSignTypedData();

  return useMutation<MultiplierSignature | undefined>({
    mutationFn: async () => {
      const _signerAddress = userWalletAddress ?? '';
      const _multiplierAddress = multiplierAddress ?? '';
      const _cometAddress = cometAddress ?? '';

      if (!isAddress(_multiplierAddress)) return;
      if (!isAddress(_cometAddress)) return;
      if (!isAddress(_signerAddress)) return;

      if (typeof cometName !== 'string') return;
      if (typeof cometVersion !== 'string') return;
      if (typeof currentMultiplierNonce !== 'bigint') return;

      const expiry = BigInt(Date.now() + expire);

      const chainId = market?.chainInformation.chainId ?? 0;

      const signature = await signTypedDataAsync({
        domain: {
          name: cometName,
          version: cometVersion,
          chainId: chainId,
          verifyingContract: _cometAddress
        },
        types: {
          Authorization: [
            { name: 'owner', type: 'address' },
            { name: 'manager', type: 'address' },
            { name: 'isAllowed', type: 'bool' },
            { name: 'nonce', type: 'uint256' },
            { name: 'expiry', type: 'uint256' }
          ]
        },
        message: {
          owner: _signerAddress,
          manager: _multiplierAddress,
          isAllowed: true,
          nonce: currentMultiplierNonce,
          expiry: expiry
        },
        primaryType: 'Authorization'
      });

      const { r, s, v } = ethers.utils.splitSignature(signature);

      return {
        r: r,
        s: s,
        v: v,
        nonce: currentMultiplierNonce,
        expiry: expiry
      };
    }
  });
};
