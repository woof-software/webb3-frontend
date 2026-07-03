import { useEffect, useState } from 'react';
import { formatUnits, isAddress } from 'viem';

import { HelperModal, Slide, SlideWithMedia } from '@components/HelperModal';
import { SlippageDropdown } from '@components/SlippageDropdown';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { formatValue } from '@helpers/numbers';
import { useCollateralSwapInputValidation } from '@hooks/collateral-swap/useCollateralSwapInputValidation';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMediaPreloader } from '@hooks/useMediaPreloader';

import { CollateralSwapFlashloanFee } from '../swap/CollateralSwapFlashloanFee';
import { CollateralSwapHighRiskAlert } from '../swap/CollateralSwapHighRiskBanner';
import { CollateralSwapSlippageLowAlert } from '../swap/CollateralSwapSlippageLowAlert';

import { CollateralSwapActionCardAssets } from './CollateralSwapActionCardAssets';
import { CollateralSwapActionCardRiskRow } from './CollateralSwapActionCardRiskRow';
import { CollateralSwapActionCardSwapRow } from './CollateralSwapActionCardSwapRow';
import { CollateralSwapCompoundFee } from './CollateralSwapCompoundFee';
import { CollateralSwapExchangeRate } from './CollateralSwapExchangeRate';
import CollateralSwapInput from './CollateralSwapInput';
import CollateralSwapNoAssetCard from './CollateralSwapNoAssetCard';
import { CollateralSwapSendButton } from './CollateralSwapSendButton';
import { CollateralSwapUnsupportedToken } from './CollateralSwapUnsupportedToken';

const SLIDES: Array<Slide | SlideWithMedia> = [
  {
    id: 'collateral-swap-slide-1',
    title: '',
    description: 'Effortlessly manage your assets with Collateral Swap. Seamlessly exchange one of the collaterals for another without the need to close your existing position.',
    duration: 3,
    mediaType: 'img',
    url: `${window.location.origin}/images/collateral-swap-preview.avif?v=1`
  },
  {
    id: 'collateral-swap-slide-2',
    title: '',
    description: 'Just select the collateral you wish to swap out and the asset you want in return—it\'s that simple. Stay flexible and responsive to market changes while maintaining your position.',
    duration: 3,
    mediaType: 'video',
    url: `${window.location.origin}/videos/collateral-swap-preview.av1?v=1`
  }
];

const slippagePercents = ['0.1', '0.5', '1'];

export default function CollateralSwapActionCard() {
  const {
    fromAddress,
    toAddress,
    inputValue,
    setInputValue,
    slippagePercent,
    setSlippagePercent
  } = CollateralSwapContext.use();

  useMediaPreloader(SLIDES);

  const isFromAddressValid = isAddress(fromAddress);
  const isToAddressValid = isAddress(toAddress);

  const [isHelperModal, setIsHelperModal] = useState(false);

  const srcCollateral = useMarketCollateral(fromAddress);

  const {
    balance = 0n,
    decimals = 0,
    symbol: collateralSymbol = ''
  } = srcCollateral ?? {};

  const error = useCollateralSwapInputValidation();

  const availableBalance = formatValue(decimals, balance);

  const onMaxClick = () => {
    setInputValue(formatUnits(balance, decimals));
  };

  const handleHelperModalClose = () => {
    setIsHelperModal(false);
  };

  const onHelpClick = () => {
    setIsHelperModal(true);
  };

  useEffect(() => {
    setInputValue('');
  }, [fromAddress, toAddress]);

  if (isFromAddressValid && isToAddressValid) {
    return (
      <div className={'collateral-swap-action-card'}>
        {isHelperModal &&
          <HelperModal
            handleClose={handleHelperModalClose}
            title={'Meet the Collateral Swap'}
            slides={SLIDES}
          />
        }
        <CollateralSwapUnsupportedToken />
        <CollateralSwapInput
          onHelpClick={onHelpClick}
          onMaxClick={onMaxClick}
          availablePrefix={availableBalance}
          symbol={collateralSymbol}
          value={inputValue}
          onChange={setInputValue}
          error={error}
        />
        <div className={'collateral-swap-action-card__details'}>
          <CollateralSwapExchangeRate />
          <CollateralSwapActionCardAssets />
          <div className={'collateral-swap-action-card__divider divider'}></div>
          <CollateralSwapActionCardRiskRow />
          <CollateralSwapHighRiskAlert />
          <CollateralSwapActionCardSwapRow />
          <CollateralSwapFlashloanFee />
          <CollateralSwapCompoundFee />
          <SlippageDropdown
            tooltipContent={'Slippage Tolerance is the maximum price difference allowed for your trade. If the asset’s price changes beyond this limit between confirmation and finalization on the blockchain, the transaction is canceled.'}
            slippagePercents={slippagePercents}
            value={slippagePercent}
            onChange={setSlippagePercent}
          />
          <CollateralSwapSlippageLowAlert />
          <CollateralSwapSendButton />
        </div>
      </div>
    );
  }

  return (
    <CollateralSwapNoAssetCard
      isFromCollateralSelected={isFromAddressValid}
    />
  );
}
