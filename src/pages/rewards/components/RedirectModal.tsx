import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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

  if (!isOpen) return null;

  return (
    <div className="modal modal--active">
      <div className="modal__backdrop" onClick={closeModal} />
      <div className="modal__content L4">
        <div className="modal__content__header">
          <div className="modal__content__header__left"></div>
          <h4 className="heading heading--emphasized heading">Redirection to Merkl</h4>
          <div className="modal__content__header__right" onClick={closeModal}>
            <CircleClose />
          </div>
        </div>
        <div className="modal__content__icon-holder">
          <div className={`modal__content__icon asset asset--COMP`}></div>
        </div>
        <div className="modal__content__paragraph">
          <p className="body">Text which explain redirect</p>
        </div>
        <div className="modal__content__action-row">
          <a
            href={`https://app.merkl.xyz/users/${account}`}
            className="button button--x-large button--borrow"
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