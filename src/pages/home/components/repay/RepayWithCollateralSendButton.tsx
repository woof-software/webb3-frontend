import { abs } from '@helpers/numeric';
import { clsx } from 'clsx';
import { ethers, constants } from 'ethers';
import { useEffect, useState } from 'react';
import { isAddress, isHex, parseUnits } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';

import { Counter } from '@components/Counter';
import NetworkSwitchModal, { NetworkSwitchModalStateHydrated } from '@components/NetworkSwitchModal';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import LeveragedPositionContext from '@contexts/LeveragedPositionContext';
import { useEthersProvider } from '@helpers/ethersAdapter';
import { useMarketFlashLoan } from '@hooks/flash-loan/useMarketFlashLoan';
import { useLeverageContractAddress } from '@hooks/leveraged-position/useLeverageContractAddress';
import { useLeverageContractAllowance } from '@hooks/leveraged-position/useLeverageContractAllowance';
import { useLeverageContractApprove } from '@hooks/leveraged-position/useLeverageContractApprove';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useTermsSignature } from '@hooks/leveraged-position/useTermsSignature';
import { useUserAgreementStatus } from '@hooks/leveraged-position/useUserAgreementStatus';
import { useCollateralRepayInputValidation } from '@hooks/repay/useCollateralRepayInputValidation';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';
import { useCollateralRepayTransaction } from '@hooks/repay/useCollateralRepayTransaction';
import { useExecuteAtTime } from '@hooks/useExecuteAtTime';
import { useMarket } from '@hooks/useMarket';

const DEFAULT_MULTIPLIER_SIGNATURE_EXPIRATION = 1000 * 60 * 5;

export const RepayWithCollateralSendButton = () => {
  const { address: userWalletAddress } = useAccount();

  const [networkSwitchState, setNetworkSwitchState] = useState<NetworkSwitchModalStateHydrated | undefined>(undefined);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);

  const {
    setIsActivated,
    inputValue,
    fromAddress: srcAddress,
    setInputValue: setCollateralAmount,
  } = CollateralSwapContext.use();

  const { addTransaction } = LeveragedPositionContext.use();

  const walletChainId = useChainId();

  const {
    isFetching: isTransactionInProgress,
    isSuccess: isTransactionSuccess
  } = useWaitForTransactionReceipt({ hash: transactionHash });

  const provider = useEthersProvider();

  const market = useMarket();

  const baseAsset = useMarketBaseAsset();

  const { chainInformation } = market ?? {};

  const marketChainId = chainInformation?.chainId;

  const { data: marketFlashLoan } = useMarketFlashLoan();

  const {
    data: agreementSignature,
    isPending: isAgreementStatusPending,
    refetch: refetchAgreementSignature
  } = useUserAgreementStatus(userWalletAddress);

  const {
    data: quote,
    isFetching: isQuoteFetching
  } = useCollateralRepayQuote();

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
    sendTransactionAsync,
    isPending: isMultiplierConfirmationPending
  } = useCollateralRepayTransaction();

  useEffect(() => {
    if (!isTransactionSuccess) return;

    setCollateralAmount('');
  }, [isTransactionSuccess]);

  useExecuteAtTime(resetManagerApprove, Number(signature?.expiry));

  const isError = !!useCollateralRepayInputValidation();

  const executeTransaction = async () => {
    const baseAssetDecimals = baseAsset?.decimals;
    
    if (!baseAssetDecimals) return;
    
    const _toContractAddress = toContractAddress ?? '';
    const cometAddress = market?.marketAddress ?? '';
    const swapCallData = quote?.callData.data ?? '';
    const loanPluginSelector = marketFlashLoan?.pluginSelector ?? '';
    const swapPluginSelector = quote?.pluginSelector ?? '';
    const collateralAmount = BigInt(quote?.fromAmount ?? 0n);
    const baseAssetAmount = parseUnits(inputValue, baseAssetDecimals);
    const _srcAddress = srcAddress ?? '';

    if (!isAddress(_toContractAddress)) return;
    if (!isAddress(cometAddress)) return;
    if (!isAddress(_srcAddress)) return;

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
            collateralAddress: _srcAddress,
            collateralAmount: collateralAmount,
            // Should trigger the "max" action for the contract if the max button is pressed
            baseAssetAmount: baseAssetAmount === abs(baseAsset.balance) ? constants.MaxUint256.toBigInt() : baseAssetAmount,
            toContractAddress: _toContractAddress,
          });

          setTransactionHash(hash);

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
            collateralAddress: _srcAddress,
            collateralAmount: collateralAmount,
            baseAssetAmount: baseAssetAmount === abs(baseAsset.balance) ? constants.MaxUint256.toBigInt() : baseAssetAmount,
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
