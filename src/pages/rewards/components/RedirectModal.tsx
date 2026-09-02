import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { CircleClose } from '@components/Icons';
import type { Web3 } from '@contexts/Web3Context';

interface RedirectModalProps {
  web3: Web3;
}

export const RedirectModal = ({ web3 }: RedirectModalProps) => {
  const { account } = web3.write;

  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.get('rewardsRedirectModal') === 'true';

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('rewardsRedirectModal');
    setSearchParams(params, {replace: true});
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [searchParams, isOpen]);

  return (
    <div className={`modal${isOpen ? ' modal--active' : ''}`}>
      <div className="modal__backdrop" onClick={closeModal} />
      <div className="modal__content L4">
        <div className="modal__content__header">
          <div className="modal__content__header__left"></div>
          <h4 className="heading heading--emphasized heading">You are about to leave Compound</h4>
          <div className="modal__content__header__right" onClick={closeModal}>
            <CircleClose />
          </div>
        </div>
        <div className="modal__content__icons-holder">
          <div className={`asset asset--COMP`} />
          <div className="modal__content__icons-holder__arrows"></div>
          <div className={`asset asset--MERKL`} />
        </div>
        <div className="modal__content__paragraph">
          <p className="body">Your COMP rewards are available on Merkl. Log in to your Merkl account to claim them.</p>
        </div>
        <div className="modal__content__action-row">
          <a
            href={account ? `https://app.merkl.xyz/users/${account}` : `https://app.merkl.xyz/users/`}
            className="button button--x-large button--supply"
            onClick={closeModal}
            target="_blank"
            rel="noreferrer"
          >
            Proceed
          </a>
        </div>
      </div>
    </div>
  );
};