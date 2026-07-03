import { Address, isAddress } from 'viem';
import { useReadContract } from 'wagmi';

import CometAbi from '@helpers/abis/Comet';
import { useMarket } from '@hooks/useMarket';

/**
 * Fetches the user nonce from the Comet contract for a given wallet address.
 *
 * @param [walletAddress] - The wallet address for which the nonce should be fetched. If not provided, the function will attempt to determine the address.
 * @returns Result of `useReadContract` execution which contains user nonce.
 *
 * The function performs the following:
 * - Retrieves the market contract address and chain ID from the market context.
 * - Determines whether a valid wallet address is provided.
 * - Reads the `userNonce` function from the comet contract using the provided wallet address as an argument.
 */
export const useMarketNonce = (walletAddress?: Address) => {
  const market = useMarket();

  const marketAddress = market?.marketAddress;
  const chainId = market?.chainInformation.chainId;

  let addressToFetch: Address | undefined;

  if (isAddress(walletAddress ?? '')) {
    addressToFetch = marketAddress as Address | undefined;
  }

  const { data, ...query } = useReadContract({
    address: addressToFetch,
    chainId: chainId,
    abi: CometAbi,
    functionName: 'userNonce',
    args: [walletAddress]
  });

  return {
    data: typeof data === 'bigint' ? data : undefined,
    ...query
  };
};
