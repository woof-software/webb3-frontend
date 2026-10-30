import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

import { ModuleKind, transpileModule } from 'typescript';

const networks = {
  SEPOLIA: 'ethereum-sepolia',
  MAINNET: 'ethereum-mainnet',
  POLYGON: 'polygon-mainnet',
  ARBITRUM: 'arbitrum-mainnet',
  SCROLL: null,
  OPTIMISM: 'optimism-mainnet',
  AVALANCHE: 'avalanche-mainnet',
  FUJI: 'avalanche-fuji',
  BASE_MAINNET: 'base-mainnet',
  MANTLE: 'mantle-mainnet',
  LINEA: 'linea-mainnet',
  UNICHAIN: 'unichain-mainnet',
  RONIN: 'ronin-mainnet',
};

function loadEnvVars(env: Record<string, string>) {
  const source = readFileSync(resolve(__dirname, '../envVars.ts'), 'utf8').replaceAll('import.meta.env', 'testEnv');
  const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
  const exports: Record<string, string> = {};
  runInNewContext(outputText, { exports, testEnv: env });
  return exports;
}

test.each(Object.entries(networks))('%s uses its own override and preserves its fallback', (network, path) => {
  const key = `${network}_URL`;
  const fallback = path ? `https://proxy.example/${path}` : 'https://rpc.scroll.io';
  const env = { VITE_V3_RPC_PROVIDER_HOST: 'proxy.example' };
  expect(loadEnvVars(env)[key]).toBe(fallback);
  expect(loadEnvVars({ ...env, [`VITE_${key}`]: '' })[key]).toBe(fallback);
  const overridden = loadEnvVars({ ...env, [`VITE_${key}`]: 'http://localhost:8545/custom?key=test' });
  expect(overridden[key]).toBe('http://localhost:8545/custom?key=test');
  const otherNetwork = network === 'MAINNET' ? 'POLYGON' : 'MAINNET';
  expect(overridden[`${otherNetwork}_URL`]).toBe(`https://proxy.example/${networks[otherNetwork]}`);
});

test('playground config overrides mainnet', () => {
  const env = Object.fromEntries(
    readFileSync(resolve(__dirname, '../.env.playground'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
  expect(loadEnvVars(env).MAINNET_URL).toBe('http://localhost:8545');
});
