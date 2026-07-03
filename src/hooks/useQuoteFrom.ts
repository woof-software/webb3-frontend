import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';

import { fetchQuoteFrom, FlashLoanProvider, SwapAggregator, SwapQuote } from '@helpers/leverage/leverage-api';

export type UseQuoteFromArgs = {
  amount?: bigint;
  chainId?: number;
  fromTokenAddress?: string;
  toTokenAddress?: string;
  userAddress?: string;
  slippage?: number;
  aggregator?: SwapAggregator;
  excludeDexs?: FlashLoanProvider;
}

const CACHE_TTL = 15000;

/**
 * Retrieves a swap quote for converting a specific amount of one token to another on a given blockchain.
 * The hook uses 'from-amount' swap API and TanStack Query to fetch and manage the state of swap
 * quotes from the backend.
 */
export const useQuoteFrom = (args?: UseQuoteFromArgs) => {
  const {
    amount,
    chainId,
    fromTokenAddress,
    toTokenAddress,
    userAddress,
    slippage,
    aggregator = SwapAggregator.OKX,
    excludeDexs
  } = args ?? {};

  const isAmountValid = (amount ?? 0n) > 0n;
  const isChainIdValid = chainId !== undefined;
  const isSlippageValid = !Number.isNaN(slippage) && Number.isFinite(slippage);

  const isFromAddressValid = isAddress(fromTokenAddress ?? '');
  const isToAddressValid = isAddress(toTokenAddress ?? '');
  const isUserAddressValid = isAddress(userAddress ?? '');

  const isEnabled =
    isAmountValid &&
    isChainIdValid &&
    isFromAddressValid &&
    isToAddressValid &&
    isUserAddressValid &&
    isSlippageValid;

  return useQuery<SwapQuote>({
    queryKey: ['swap-quote', 'from', chainId, userAddress, fromTokenAddress, toTokenAddress, slippage, `${amount}`],
    enabled: isEnabled,
    queryFn: ({ signal }) => {
      const _amount = amount ?? 0n;
      const _chainId = chainId ?? 0;
      const _fromTokenAddress = fromTokenAddress ?? '';
      const _toTokenAddress = toTokenAddress ?? '';
      const _userAddress = userAddress ?? '';
      const _excludeDexs = excludeDexs ? [excludeDexs] : [];

      return fetchQuoteFrom({
        amount: `${_amount}`,
        chain: _chainId,
        fromTokenAddress: _fromTokenAddress,
        toTokenAddress: _toTokenAddress,
        userAddress: _userAddress,
        aggregator,
        slippage,
        excludeDexs: _excludeDexs
      }, { signal });
    },
    staleTime: CACHE_TTL,
    gcTime: CACHE_TTL,
    refetchInterval: CACHE_TTL + 100,
    retry: false
  });
};
