import { useMutation } from '@tanstack/react-query';
import { Address, isAddress } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import Erc20Abi from '@helpers/abis/ERC20';
import { useMarket } from '@hooks/useMarket';

/**
 * Hook for approving ERC20 token spending
 *
 * @param tokenAddress - The address of the ERC20 token contract
 * @param spenderAddress - The address that will be allowed to spend tokens
 */
export const useErc20Approve = (
  tokenAddress?: string | null,
  spenderAddress?: string | null
) => {
  const market = useMarket();

  const chainId = market?.chainInformation.chainId;

  const { writeContractAsync, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });

  return useMutation({
    mutationFn: async (amount: bigint) => {
      const _tokenAddress = tokenAddress ?? '';
      const _spenderAddress = spenderAddress ?? '';

      if (!isAddress(_tokenAddress)) throw new Error('wrong token address');
      if (!isAddress(_spenderAddress)) throw new Error('wrong spender address');

      const hash = await writeContractAsync({
        address: _tokenAddress as Address,
        abi: Erc20Abi,
        functionName: 'approve',
        args: [_spenderAddress, amount],
        chainId: chainId
      });

      return hash;
    },
    meta: {
      isConfirming,
      isConfirmed
    }
  });
};
