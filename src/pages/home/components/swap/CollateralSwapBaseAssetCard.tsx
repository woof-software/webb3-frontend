import { clsx } from 'clsx';
import { useState } from 'react';

import { Close } from '@components/Icons';
import Tooltip from '@components/Tooltip';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { assetIconForAssetSymbol } from '@helpers/assets';
import {
  formatValue,
  formatValueInDollars,
  getValueInDollars,
  PRICE_PRECISION
} from '@helpers/numbers';
import { abs } from '@helpers/numeric';
import { useMarketBaseAsset } from '@hooks/leveraged-position/useMarketBaseAsset';
import { useMediaQuery } from '@hooks/useMediaQuery';

export const CollateralSwapBaseAssetCard = () => {
  const { fromAddress, toAddress, setFromAddress, setToAddress, isActivated } = CollateralSwapContext.use();
  const isLargeScreen = useMediaQuery('(min-width: 1121px)');
  const [hoverModifier, setHoverModifier] = useState('');

  const baseAsset = useMarketBaseAsset();
  const {
    symbol = '',
    name = '',
    walletBalance = 0n,
    balance = 0n,
    decimals = 1,
    address = '',
    price = 0n,
    baseAssetPriceInDollars = 0n
  } = baseAsset ?? {};

  const isSwapAvailable = balance > 0n;
  const isRowSelected = fromAddress === address || toAddress === address;

  const formattedBalance = formatValue(decimals, abs(balance)).split('.');

  const { onClick, isDisabled, text } = (() => {
    const isSwapFrom = fromAddress === address;
    const isSwapTo = toAddress === address;

    if (isSwapFrom) {
      return {
        text: 'Swap From',
        onClick: () => {
          setFromAddress('');
          setToAddress('');
        },
        isDisabled: false
      };
    }

    if (isSwapTo) {
      return {
        text: 'Swap To',
        onClick: () => setToAddress(''),
        isDisabled: false
      };
    }

    if (!fromAddress) {
      return {
        text: 'Swap To',
        onClick: () => setFromAddress(address),
        isDisabled: !isSwapAvailable
      };
    }

    if (fromAddress && !toAddress) {
      return {
        text: 'Swap To',
        onClick: () => setToAddress(address),
        isDisabled: false
      };
    }

    return {
      text: 'Swap To',
      onClick: () => setToAddress(address),
      isDisabled: false
    };
  })();

  const handleRowClick = () => {
    if (isActivated && !isLargeScreen && !isDisabled) {
      onClick();
    }
  };

  const getMobileSwapRowStyles = () => {
    const isReverted = fromAddress && !(fromAddress === address);

    return clsx('asset asset-row__mobile-collateral-swap', {
      'asset-row__mobile-collateral-swap--disabled asset-row__mobile-collateral-swap--transformed': isDisabled,
      'asset-row__mobile-collateral-swap--active': isRowSelected && !isDisabled,
      'asset-row__mobile-collateral-swap--transformed': isReverted
    });
  };

  let formattedUsdValue = '';
  let oraclePrice = '';

  /**
   * Multiply to -1n because it's a borrow position
   */
  if (baseAsset) {
    const valueInUsd = getValueInDollars(price * balance, baseAsset) * -1n;
    formattedUsdValue = formatValueInDollars(decimals + PRICE_PRECISION, valueInUsd);

    oraclePrice = formatValueInDollars(PRICE_PRECISION, baseAssetPriceInDollars);
  }

  const tooltipContent = () => {
    return (
      <div className="tooltip__content L4">
        <h4 className="tooltip__header body--emphasized text-color--1">
          {name}
        </h4>
        <div className="tooltip__definition-list body">
          <div className="tooltip__definition-list__item">
            <dt>Oracle Price</dt>
            <dd>{oraclePrice}</dd>
          </div>
          <div className="tooltip__definition-list__item">
            <dt>Wallet Balance</dt>
            <dd>{formatValue(decimals, walletBalance)}</dd>
          </div>
          <div className="tooltip__definition-list__item">
            <dt>Loan</dt>
            <dd>{Math.abs(+formatValue(decimals, balance))}</dd>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="panel panel--assets">
      <div className="asset-row__collateral-swap-label label L2 text-color--borrow">
        Swap to the Base asset to repay the Loan
      </div>
      <div
        className={clsx(`asset-row L3`, {
          'asset-row--active': isRowSelected
        })}
        onClick={handleRowClick}
      >
        <div className={`asset-row__hover${hoverModifier}`} />
        <Tooltip content={tooltipContent()} width={340} hideArrow={true} yOffset={30}>
          <div className="asset-row__detail-content"
               onMouseEnter={() => {
                 setHoverModifier(' asset-row__hover--active');
               }}
               onMouseLeave={() => {
                 setHoverModifier('');
               }}
          >
            {!isLargeScreen && isActivated
              ? <span className={getMobileSwapRowStyles()}></span>
              : <span className={`asset asset--${assetIconForAssetSymbol(symbol)}`}></span>
            }

            <div className="asset-row__info">
              <p className="body">{name}</p>
              <div className="asset-row__info__details meta L2">
                {symbol}
                <p className="L2 meta">
                  &nbsp;•&nbsp;
                  {formatValue(decimals, walletBalance)}
                  &nbsp;in wallet
                </p>
              </div>
            </div>
          </div>
        </Tooltip>
        <div className="asset-row__balance">
          <p className="body text-color--1">
            {formattedBalance[0]}
            <span className="text-color--3">
              {'.' + formattedBalance[1]}
            </span>
          </p>
          <p className="L2 meta">
            {formattedUsdValue}
          </p>
        </div>
        <div className="asset-row__actions">
          <button
            key="collateral-swap-button"
            className={clsx('button button--collateral-swap-row mobile-hide', {
              'button--selected': fromAddress === address || toAddress === address
            })}
            disabled={isDisabled}
            onClick={onClick}
          >
            {(fromAddress === address || toAddress === address) && <Close />}
            <span>{text}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
