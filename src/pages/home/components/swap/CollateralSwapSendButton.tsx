import { clsx } from 'clsx';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { isAddress, isHex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';

import { Counter } from '@components/Counter';
import NetworkSwitchModal, { NetworkSwitchModalStateHydrated } from '@components/NetworkSwitchModal';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import LeveragedPositionContext from '@contexts/LeveragedPositionContext';
import { useEthersProvider } from '@helpers/ethersAdapter';
import { useCollateralSwapInputValidation } from '@hooks/collateral-swap/useCollateralSwapInputValidation';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useCollateralSwapTransaction } from '@hooks/collateral-swap/useCollateralSwapTransaction';
import { useCollateralsFlashLoan } from '@hooks/flash-loan/useCollateralsFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useLeverageContractAllowance } from '@hooks/leveraged-position/useLeverageContractAllowance';
import { useLeverageContractApprove } from '@hooks/leveraged-position/useLeverageContractApprove';
import { useTermsSignature } from '@hooks/leveraged-position/useTermsSignature';
import { useUserAgreementStatus } from '@hooks/leveraged-position/useUserAgreementStatus';
import { useExecuteAtTime } from '@hooks/useExecuteAtTime';
import { useMarket } from '@hooks/useMarket';

const DEFAULT_MULTIPLIER_SIGNATURE_EXPIRATION = 1000 * 60 * 5;

export const CollateralSwapSendButton = () => {
  const { address: userWalletAddress } = useAccount();

  const { setIsActivated } = CollateralSwapContext.use();

  const { addTransaction } = LeveragedPositionContext.use();

  const [networkSwitchState, setNetworkSwitchState] = useState<NetworkSwitchModalStateHydrated | undefined>(undefined);

  const walletChainId = useChainId();

  const market = useMarket();

  const { chainInformation } = market ?? {};
  const marketChainId = chainInformation?.chainId;

  const { data: collateralsFlashLoan } = useCollateralsFlashLoan();

  const {
    data: agreementSignature,
    isPending: isAgreementStatusPending,
    refetch: refetchAgreementSignature
  } = useUserAgreementStatus(userWalletAddress);

  const {
    fromAddress: srcAddress,
    toAddress: dstAddress,
    setInputValue: setCollateralAmount
  } = CollateralSwapContext.use();

  const {
    data: quote,
    isFetching: isQuoteFetching
  } = useCollateralSwapQuote();

  const toContractAddress = useLeverageContractAddress();

  const {
    mutateAsync: signAgreement,
    isPending: isAgreementSigning
  } = useTermsSignature();

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
    data: isManagerAllowed,
    refetch: refetchManagerAllowance,
    isPending: isManagerAllowancePending
  } = useLeverageContractAllowance(userWalletAddress);

  const {
    mutateAsync: signManagerApprove,
    reset: resetManagerApprove,
    data: signature,
    isPending: isApprovePending,
    isSuccess: isApproveSuccess
  } = useLeverageContractApprove(DEFAULT_MULTIPLIER_SIGNATURE_EXPIRATION);

  const {
    data: collateralSwapTransactionHash,
    sendTransactionAsync,
    isPending: isMultiplierConfirmationPending
  } = useCollateralSwapTransaction();

  const {
    isFetching: isTransactionInProgress,
    isSuccess: isTransactionSuccess
  } = useWaitForTransactionReceipt({ hash: collateralSwapTransactionHash });

  const provider = useEthersProvider();

  useEffect(() => {
    if (!isTransactionSuccess) return;

    setCollateralAmount('');
  }, [isTransactionSuccess]);

  useExecuteAtTime(resetManagerApprove, Number(signature?.expiry));

  const isError = !!useCollateralSwapInputValidation();

  const executeTransaction = async () => {
    const _toContractAddress = toContractAddress ?? '';
    const cometAddress = market?.marketAddress ?? '';
    const swapCallData = quote?.callData.data ?? '';
    const loanPluginSelector = collateralsFlashLoan?.get(dstAddress)?.pluginSelector ?? '';
    const swapPluginSelector = quote?.pluginSelector ?? '';
    const srcAmount = BigInt(quote?.fromAmount ?? 0n);
    const dstAmount = BigInt(quote?.minToAmount ?? 0n);
    const _srcAddress = srcAddress ?? '';
    const _dstAddress = dstAddress ?? '';

    if (!isAddress(_toContractAddress)) return;
    if (!isAddress(cometAddress)) return;
    if (!isAddress(_srcAddress)) return;
    if (!isAddress(_dstAddress)) return;

    if (!isHex(swapCallData)) return;
    if (!isHex(loanPluginSelector)) return;
    if (!isHex(swapPluginSelector)) return;

    if (isManagerAllowed) {
      await addTransaction(
        'collateral-swap',
        'Swap collaterals',
        async () => {
          if (!provider) {
            throw new Error('provider is undefined!');
          }

          const hash = await sendTransactionAsync({
            cometAddress: cometAddress,
            swapCallData: swapCallData,
            loanPluginSelector: loanPluginSelector,
            swapPluginSelector: swapPluginSelector,
            fromTokenAddress: _srcAddress,
            toTokenAddress: _dstAddress,
            toTokenAmount: dstAmount,
            fromTokenAmount: srcAmount,
            toContractAddress: _toContractAddress
          });

          resetManagerApprove();

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
        'collateral-swap',
        'Swap collaterals',
        async () => {
          if (!provider) {
            throw new Error('provider is undefined!');
          }

          const hash = await sendTransactionAsync({
            cometAddress: cometAddress,
            swapCallData: swapCallData,
            loanPluginSelector: loanPluginSelector,
            swapPluginSelector: swapPluginSelector,
            fromTokenAddress: _srcAddress,
            toTokenAddress: _dstAddress,
            toTokenAmount: dstAmount,
            fromTokenAmount: srcAmount,
            toContractAddress: _toContractAddress,
            signature: {
              r: signature.r,
              s: signature.s,
              v: signature.v,
              nonce: signature?.nonce,
              expiry: signature?.expiry
            }
          });

          resetManagerApprove();

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

    if (isMultiplierConfirmationPending) return 'Confirm in wallet';

    if (isTransactionInProgress) return 'Transaction in progress...';

    if (!agreementSignature?.isSigned) return 'Sign User Agreement';

    if (!isManagerAllowed) {
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
    if (isManagerAllowancePending) return true;
    if (isApprovePending) return true;
    if (isMultiplierConfirmationPending) return true;
    if (isTransactionInProgress) return true;

    if (!isManagerAllowed && !signature) return false;

    return false;
  })();

  const continueAfterNetworkSwitch = async () => {
    if (!agreementSignature?.isSigned) {
      await signAgreement();
      refetchAgreementSignature();
      return;
    }

    if (!isManagerAllowed && !signature) {
      await signManagerApprove();
      refetchManagerAllowance();
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
    if (isManagerAllowancePending) return true;

    return false;
  })();

  return (
    <>
      <NetworkSwitchModal state={networkSwitchState} onSwitchNetwork={handleSwitchNetwork} />
      <button
        className={clsx('collateral-swap-send-button', {
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
                className={clsx('text-color--3 collateral-swap-counter-hint', {
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
