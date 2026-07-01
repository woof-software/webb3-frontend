import { useSafeAppsSDK, SafeProvider } from '@safe-global/safe-apps-react-sdk';
import { useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';

export const SafeAutoConnect = () => {
  const Content = () => {
    const { connectors, connect } = useConnect();
    const { isConnected } = useAccount();
    const { connected } = useSafeAppsSDK();

    useEffect(() => {
      if (isConnected || !connected) return;

      const safeConnector = connectors.find((c) => c.id === 'safe');

      if (!safeConnector) return;

      connect({ connector: safeConnector });
    }, [isConnected, connected]);

    return null;
  }

  return (
    <SafeProvider>
      <Content />
    </SafeProvider>
  )
};