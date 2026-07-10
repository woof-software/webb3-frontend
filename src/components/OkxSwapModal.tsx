import { createOkxSwapWidget, THEME, ProviderType, OkxEvents } from '@okxweb3/dex-widget';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Theme } from '@hooks/useThemeManager';

interface OkxSwapModalProps {
  theme: Theme;
}

export const OkxSwapModal = ({ theme }: OkxSwapModalProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get('swapModal') === 'true';
  const widgetRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('swapModal');
    setSearchParams(params);
  };

  useEffect(() => {
    if (!widgetRef.current) return;

    const instance = createOkxSwapWidget(widgetRef.current, {
      params: {
        theme: theme === 'Light' ? THEME.LIGHT : THEME.DARK,
        width: 375,
        providerType: ProviderType.EVM,
        chainIds: ['1', '8453', '42161', '10', '59144', '137', '130', '5000', '534352'],
      },
      provider: window.ethereum,
      listeners: [
        {
          event: OkxEvents.ON_CONNECT_WALLET,
          handler: () => {
            window.ethereum?.enable();
          },
        },
      ],
    });

    return () => {
      instance.destroy();
    };
  }, [theme]);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [searchParams]);

  return (
    <div className={`modal modal--connect-wallet${isOpen ? ' modal--active' : ''}`}>
      <div className="modal__backdrop" onClick={closeModal} />
      <div className="modal__content okx-modal-content">
        <div ref={widgetRef} className="okx-widget-container"/>
      </div>
    </div>
  );
};