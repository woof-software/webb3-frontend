import { Address, isAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import Erc20Abi from '@helpers/abis/ERC20';
import { useMarket } from '@hooks/useMarket';

/**
 * Checks the ERC20 token allowance for a spender address
 *
 * @param tokenAddress - The address of the ERC20 token contract
 * @param spenderAddress - The address that is allowed to spend tokens
 */
export const useErc20Allowance = (
  tokenAddress?: string | null,
  spenderAddress?: string | null
) => {
  const market = useMarket();
  const { address: walletAddress } = useAccount();

  const chainId = market?.chainInformation.chainId;

  let addressToFetch: Address | undefined;

  if (
    isAddress(tokenAddress ?? '') &&
    isAddress(walletAddress ?? '') &&
    isAddress(spenderAddress ?? '')
  ) {
    addressToFetch = tokenAddress as Address;
  }

  const { data: allowance, ...query } = useReadContract({
    address: addressToFetch,
    chainId: chainId,
    abi: Erc20Abi,
    functionName: 'allowance',
    args: [walletAddress, spenderAddress]
  });

  return {
    data: typeof allowance === 'bigint' ? allowance : undefined,
    ...query
  };
};
