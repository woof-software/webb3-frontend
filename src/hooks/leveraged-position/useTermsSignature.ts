import { useMutation } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { useAccount, useSignMessage } from 'wagmi';

import { useAgreementCurrent } from '@hooks/leveraged-position/useAgreementCurrent';
import { useAgreementSign } from '@hooks/leveraged-position/useAgreementSign';

/**
 * A hook that provides functionality to handle the signing of terms and agreements.
 * This hook retrieves the current agreement status, the agreement content, and the ability to sign the message.
 *
 * @returns object containing the signAgreement mutation and the signTerms function with necessary checks
 * and signAgreement.mutateAsync call.
 */
export const useTermsSignature = () => {
  const { data: signCurrent } = useAgreementCurrent();
  const signAgreement = useAgreementSign();

  const { signMessageAsync } = useSignMessage();
  const { address: walletAddress } = useAccount();

  return useMutation({
    mutationFn: async () => {
      const _walletAddress = walletAddress ?? '';
      if (!isAddress(_walletAddress)) return;
      if (!signCurrent) return;

      const { text, id, time } = signCurrent;

      const signature = await signMessageAsync({
        message: text
      });

      return signAgreement.mutateAsync({
        agreementId: id,
        signedAgreement: signature,
        signedAt: time,
        signerAddress: _walletAddress
      });
    }
  });
};
