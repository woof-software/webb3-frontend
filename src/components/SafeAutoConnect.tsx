import { useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';

export const SafeAutoConnect = () => {
  const { connectors, connect, status } = useConnect();
  const { isConnected, connector } = useAccount();

  useEffect(() => {
    if (isConnected && connector?.id === 'safe') return;
    if (status === 'pending') return;

    const safeConnector = connectors.find((c) => c.id === 'safe');
    if (!safeConnector) return;

    let active = true;
    // True only inside a Safe: the connector checks for a frame, then asks the parent for the Safe.
    safeConnector.isAuthorized().then((isSafeContext) => {
      if (active && isSafeContext) connect({ connector: safeConnector });
    });
    return () => {
      active = false;
    };
  }, [isConnected, connector, connectors, connect, status]);

  return null;
};

