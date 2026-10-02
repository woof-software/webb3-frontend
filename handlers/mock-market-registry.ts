import { rest } from 'msw';

import { getMarketRegistryEndpoint } from '@helpers/urls';

import mockMarketRegistryResponse from '../__tests__/mocks/mockMarketRegistryResponse.json';

export const marketRegistryHandlers = [
  rest.get(getMarketRegistryEndpoint(), (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockMarketRegistryResponse));
  }),
];
