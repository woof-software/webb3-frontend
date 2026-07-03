import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { Hex } from 'viem';
import { useClient } from 'wagmi';

export const useAsyncWaitTransaction = () => {
  const wagmiClient = useClient();

  return useMutation({
    mutationFn: (hash: Hex) => {
      if (!wagmiClient) {
        throw new Error('wagmiClient is undefined');
      }

      const ethersProvider = new ethers.providers.JsonRpcProvider(
        wagmiClient.transport.url,
        wagmiClient.chain.id
      );

      return ethersProvider.getTransaction(hash);
    }
  });
};

