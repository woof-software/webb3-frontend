import { Address, isAddress } from 'viem';
import { useReadContract } from 'wagmi';


import CometAbi from '@helpers/abis/Comet';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useMarket } from '@hooks/useMarket';

/**
 * Before multiplier transaction we must check if Multiplier contract
 * is allowed to manipulate user balance on the Comet contract.
 *
 * @param [walletAddress] - The address of the user wallet which will
 * be checked with comet.isAllowed(walletAddress, multiplier);
 */
export const useLeverageContractAllowance = (walletAddress?: Address) => {
  const market = useMarket();

  const multiplierAddress = useLeverageContractAddress();

  const marketAddress = market?.marketAddress;
  const chainId = market?.chainInformation.chainId;

  let addressToFetch: Address | undefined;

  if (isAddress(walletAddress ?? '') && isAddress(multiplierAddress ?? '')) {
    addressToFetch = marketAddress as Address | undefined;
  }

  const { data: isAllowed, ...query } = useReadContract({
    address: addressToFetch,
    chainId: chainId,
    abi: CometAbi,
    functionName: 'isAllowed',
    args: [walletAddress, multiplierAddress]
  });

  return {
    data: typeof isAllowed === 'boolean' ? isAllowed : undefined,
    ...query
  };
};
