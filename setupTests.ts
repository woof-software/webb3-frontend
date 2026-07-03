import { server } from './handlers/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Remove this mock when arbitrum mainnet node provider is available
jest.mock('./envVars', () => ({
  ARBITRUM_URL: 'https://rpc.ankr.com/arbitrum/test-key',
}))