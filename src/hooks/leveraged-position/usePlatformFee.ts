import { useQuery } from '@tanstack/react-query';

import { getPlatformFee } from '@helpers/leverage/leverage-api';

export const usePlatformFee = () => {
  const { data, ...options } = useQuery({
    queryKey: ['swap', 'platform'],
    queryFn: getPlatformFee,
    select: (data) => data.percent
  });

  return { data: data, ...options };
};