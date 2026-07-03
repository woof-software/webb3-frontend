import { clsx } from 'clsx';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { isAddress, isHex, parseUnits } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';

import { Counter } from '@components/Counter';
import NetworkSwitchModal, { NetworkSwitchModalStateHydrated } from '@components/NetworkSwitchModal';
import LeveragedPositionContext from '@contexts/LeveragedPositionContext';
import MultiplierContext from '@contexts/MultiplierContext';
import { useEthersProvider } from '@helpers/ethersAdapter';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useLeverageContractAllowance } from '@hooks/leveraged-position/useLeverageContractAllowance';
import { useLeverageContractApprove } from '@hooks/leveraged-position/useLeverageContractApprove';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useTermsSignature } from '@hooks/leveraged-position/useTermsSignature';
import { useUserAgreementStatus } from '@hooks/leveraged-position/useUserAgreementStatus';
import { useMultiplierInputValidation } from '@hooks/multiplier/useMultiplierInputValidation';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';
import { useMultiplyTransaction } from '@hooks/multiplier/useMultiplyTransaction';
import { useAsyncWaitTransaction } from '@hooks/useAsyncWaitTransaction';
import { useErc20Allowance } from '@hooks/useErc20Allowance';
import { useErc20Approve } from '@hooks/useErc20Approve';
import { useExecuteAtTime } from '@hooks/useExecuteAtTime';
import { useMarket } from '@hooks/useMarket';

const DEFAULT_MULTIPLIER_SIGNATURE_EXPIRATION = 1000 * 60 * 5;

export const MultiplierSendButton = () => {
  const { address: userWalletAddress } = useAccount();
  const [networkSwitchState, setNetworkSwitchState] = useState<NetworkSwitchModalStateHydrated | undefined>(undefined);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [isWaitingForAllowanceUpdate, setIsWaitingForAllowanceUpdate] = useState(false);
  const { setIsActivated } = MultiplierContext.use();

  const { addTransaction } = LeveragedPositionContext.use();

  const walletChainId = useChainId();

  const provider = useEthersProvider();

  const {
    isFetching: isTransactionInProgress,
    isSuccess: isTransactionSuccess
  } = useWaitForTransactionReceipt({ hash: transactionHash });

  const market = useMarket();

  const {
    mutateAsync: waitTransactionAsync,
    isPending: isCollateralTransactionPending
  } = useAsyncWaitTransaction();

  const { chainInformation } = market ?? {};
  const marketChainId = chainInformation?.chainId;

  const { data: marketFlashLoan } = useMarketFlashLoan();

  const {
    data: agreementSignature,
    isPending: isAgreementStatusPending,
    refetch: refetchAgreementSignature
  } = useUserAgreementStatus(userWalletAddress);

  const {
    supply: collateralAmount,
    collateral: collateralAddress,
    setSupply,
    setMultiplierValue
  } = MultiplierContext.use();

  const {
    data: quote,
    isFetching: isQuoteFetching
  } = useMultiplierQuote();

  const toContractAddress = useLeverageContractAddress();

  const collateral = useMarketCollateral(collateralAddress);

  const {
    mutateAsync: signAgreement,
    isPending: isAgreementSigning
  } = useTermsSignature();

  const collateralAmountBn = parseUnits(collateralAmount, collateral?.decimals ?? 0);

  const { switchChainAsync } = useSwitchChain();

  const handleRequestNetworkSwitch = () => {
    if (marketChainId && walletChainId) {
      setNetworkSwitchState({
        fromChainId: walletChainId,
        toChainId: marketChainId,
        onRequestClose: () => {
          setNetworkSwitchState(undefined);
        }
      });
    }
  };

  const handleSwitchNetwork = async () => {
    if (walletChainId === marketChainId) return;

    try {
      if (marketChainId) {
        await switchChainAsync({ chainId: marketChainId });
      }
    } catch (error) {
      console.error('Network switch failed:', error);
      setNetworkSwitchState(undefined);
    }

    setNetworkSwitchState(undefined);
    await continueAfterNetworkSwitch();
  };

  const {
    data: isLeverageAllowed,
    refetch: refetchLeverageAllowance,
    isPending: isLeverageAllowancePending
  } = useLeverageContractAllowance(userWalletAddress);

  const {
    mutateAsync: signMultiplierApprove,
    reset: resetMultiplierApprove,
    data: signature,
    isPending: isApprovePending,
    isSuccess: isApproveSuccess
  } = useLeverageContractApprove(DEFAULT_MULTIPLIER_SIGNATURE_EXPIRATION);

  const {
    data: collateralAllowance,
    refetch: refetchCollateralAllowance,
    isFetching: isCollateralAllowanceFetching
  } = useErc20Allowance(collateralAddress, toContractAddress);

  const {
    mutateAsync: approveCollateral,
    isPending: isCollateralConfirmationPending
  } = useErc20Approve(collateralAddress, toContractAddress);

  const isEnoughCollateralAllowance = (collateralAllowance ?? 0n) >= collateralAmountBn;

  const {
    sendTransactionAsync,
    isPending: isMultiplierConfirmationPending
  } = useMultiplyTransaction();

  useEffect(() => {
    if (isTransactionSuccess) {
      setSupply('');
      setMultiplierValue(1);
    }
  }, [isTransactionSuccess]);

  useExecuteAtTime(resetMultiplierApprove, Number(signature?.expiry));

  const isError = !!useMultiplierInputValidation();

  const executeTransaction = async () => {
    const _toContractAddress = toContractAddress ?? '';
    const cometAddress = market?.marketAddress ?? '';
    const swapCallData = quote?.callData.data ?? '';
    const loanPluginSelector = marketFlashLoan?.pluginSelector ?? '';
    const swapPluginSelector = quote?.pluginSelector ?? '';
    const baseAssetAmount = BigInt(quote?.fromAmount ?? 0n);
    const _collateralAddress = collateralAddress ?? '';

    if (!isAddress(_toContractAddress)) return;
    if (!isAddress(cometAddress)) return;
    if (!isAddress(_collateralAddress)) return;

    if (!isHex(swapCallData)) return;
    if (!isHex(loanPluginSelector)) return;
    if (!isHex(swapPluginSelector)) return;

    if (isLeverageAllowed) {
      await addTransaction(
        'multiplier',
        'Multiply collateral',
        async () => {
          if (!provider) {
            throw new Error('provider is undefined!');
          }

          const hash = await sendTransactionAsync({
            cometAddress: cometAddress,
            swapCallData: swapCallData,
            loanPluginSelector: loanPluginSelector,
            swapPluginSelector: swapPluginSelector,
            collateralAddress: _collateralAddress,
            baseAssetAmount: baseAssetAmount,
            collateralAmount: collateralAmountBn,
            toContractAddress: _toContractAddress
          });

          setTransactionHash(hash);

          resetMultiplierApprove();

          const receipt = await provider.getTransaction(hash);

          try {
            await receipt.wait();
          } finally {
            setIsActivated(false);
          }

          return receipt;
        },
        0,
        async () => ethers.BigNumber.from(0),
        []
      );
    } else {
      if (!signature) return;

      await addTransaction(
        'multiplier',
        'Multiply collateral',
        async () => {
          if (!provider) {
            throw new Error('provider is undefined!');
          }

          const hash = await sendTransactionAsync({
            cometAddress: cometAddress,
            swapCallData: swapCallData,
            loanPluginSelector: loanPluginSelector,
            swapPluginSelector: swapPluginSelector,
            collateralAddress: _collateralAddress,
            baseAssetAmount: baseAssetAmount,
            collateralAmount: collateralAmountBn,
            toContractAddress: _toContractAddress,
            signature: {
              r: signature.r,
              s: signature.s,
              v: signature.v,
              nonce: signature?.nonce,
              expiry: signature?.expiry
            }
          });

          setTransactionHash(hash);

          resetMultiplierApprove();

          const receipt = await provider.getTransaction(hash);

          try {
            await receipt.wait();
          } finally {
            setIsActivated(false);
          }

          return receipt;
        },
        0,
        async () => ethers.BigNumber.from(0),
        []
      );
    }
  };

  const buttonText = (() => {
    if (!quote) return 'Submit Transaction';

    if (isMultiplierConfirmationPending || isCollateralConfirmationPending) return 'Confirm in wallet';

    if (isTransactionInProgress) return 'Transaction in progress...';
    if (isCollateralTransactionPending || isWaitingForAllowanceUpdate) return 'Approving Collateral...';

    if (!agreementSignature?.isSigned) return 'Sign User Agreement';

    if (!isEnoughCollateralAllowance) return 'Approve Collateral';

    if (!isLeverageAllowed) {
      if (!isApproveSuccess) return 'Sign Approval';

      if (isApprovePending) return 'Signing Approval...';
    }

    return 'Submit Transaction';
  })();

  const isButtonDisabled = (() => {
    if (isError) return true;
    if (!quote) return true;

    if (isAgreementStatusPending) return true;
    if (isQuoteFetching) return true;
    if (isAgreementSigning) return true;
    if (isLeverageAllowancePending) return true;
    if (isApprovePending) return true;
    if (isCollateralAllowanceFetching) return true;
    if (isCollateralConfirmationPending) return true;
    if (isMultiplierConfirmationPending) return true;
    if (isCollateralTransactionPending) return true;
    if (isWaitingForAllowanceUpdate) return true;

    if (!isEnoughCollateralAllowance) return false;
    if (!isLeverageAllowed && !signature) return false;

    return false;
  })();

  const continueAfterNetworkSwitch = async () => {
    if (!agreementSignature?.isSigned) {
      await signAgreement();
      refetchAgreementSignature();
      return;
    }

    if (!isEnoughCollateralAllowance) {
      setIsWaitingForAllowanceUpdate(true);

      try {
        const hash = await approveCollateral(collateralAmountBn);

        const { wait } = await waitTransactionAsync(hash);

        await wait();
      } finally {
        await refetchCollateralAllowance();
        
        setIsWaitingForAllowanceUpdate(false);
      }

      return;
    }

    if (!isLeverageAllowed && !signature) {
      await signMultiplierApprove();
      refetchLeverageAllowance();
      return;
    }

    await executeTransaction();
  };

  const onButtonClick = async () => {
    if (isButtonDisabled) return;

    if (walletChainId !== marketChainId) {
      handleRequestNetworkSwitch();
      return;
    }

    await continueAfterNetworkSwitch();
  };

  const isLoading = (() => {
    if (isAgreementStatusPending) return true;
    if (isQuoteFetching) return true;
    if (isLeverageAllowancePending) return true;
    if (isCollateralAllowanceFetching) return true;

    return false;
  })();

  return (
    <>
      <NetworkSwitchModal state={networkSwitchState} onSwitchNetwork={handleSwitchNetwork} />
      <button
        className={clsx('multiplier-send-button', {
          'placeholder-content': isLoading
        })}
        disabled={isButtonDisabled}
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
      {!!signature && (
        <Counter
          end={Number(signature.expiry)}
          render={(ms) => {
            let formatted = '';

            const sec = Math.floor(ms / 1000);
            const min = Math.floor(sec / 60);
            const hr = Math.floor(min / 60);

            if (sec < 60) {
              formatted = `${sec} second${sec !== 1 ? 's' : ''}`;
            } else if (min < 60) {
              const s = sec % 60;

              formatted = `${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } else if (hr < 24) {
              const m = min % 60;

              formatted = `${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            }

            return (
              <p
                className={clsx('text-color--3 multiplier-counter-hint', {
                  'blink--2s': ms <= 60000 && ms > 10000,
                  'blink--1s': ms <= 10000
                })}
              >
                {ms < 1000 && 'Signature expired'}
                {ms >= 1000 && `Signature expires in ${formatted}`}
              </p>
            );
          }}
        />
      )}
    </>
  );
};