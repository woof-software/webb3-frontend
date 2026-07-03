import { useMutation } from '@tanstack/react-query';

import { postAgreementSign, PostAgreementSignArgs } from '@helpers/leverage/leverage-api';


/**
 * Custom hook that handles the signing of agreements via a mutation.
 */
export function useAgreementSign() {
  return useMutation({
    mutationFn: (params: PostAgreementSignArgs) => postAgreementSign(params)
  });
}
