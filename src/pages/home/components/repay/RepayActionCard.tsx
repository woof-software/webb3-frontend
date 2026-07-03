import { useEffect, useState } from 'react';
import { isAddress } from 'viem';

import { HelperModal, Slide, SlideWithMedia } from '@components/HelperModal';
import { SlippageDropdown } from '@components/SlippageDropdown';
import CollateralSwapContext from '@contexts/CollateralSwapContext';
import { useMediaPreloader } from '@hooks/useMediaPreloader';

import {
  RepayCollateralRow
} from '../repay/RepayCollateralRow';
import { RepayFlashloanFee } from '../repay/RepayFlashloanFee';
import { RepayHighRiskAlert } from '../repay/RepayHighRiskBanner';
import { RepayInput } from '../repay/RepayInput';
import { RepayLoanRow } from '../repay/RepayLoanRow';
import CollateralSwapNoAssetCard from '../swap/CollateralSwapNoAssetCard';

import { RepayCompoundFee } from './RepayCompoundFee';
import { RepayExchangeRate } from './RepayExchangeRate';
import { RepayRiskRow } from './RepayRiskRow';
import { RepaySlippageLowBanner } from './RepaySlippageLowBanner';
import { RepaySwapRow } from './RepaySwapRow';
import { RepayUnsupportedToken } from './RepayUnsupportedToken';
import { RepayWithCollateralSendButton } from './RepayWithCollateralSendButton';

const SLIDES: Array<Slide | SlideWithMedia> = [
  {
    id: 'repay-slide-1',
    title: '',
    description: 'Repaying your loan is now smarter and more flexible. With our Repay Loan with Collateral feature, you can use your deposited collateral to repay your loan directly.',
    duration: 3,
    mediaType: 'img',
    url: `${window.location.origin}/images/repay-preview.avif?v=1`
  },
  {
    id: 'repay-slide-2',
    title: '',
    description: 'Just select the collateral and pair it with the loan position you’d like to reduce or close. Settle your debts conveniently—straight from your collateral holdings.',
    duration: 3,
    mediaType: 'video',
    url: `${window.location.origin}/videos/repay-preview.av1?v=1`
  }
];

const slippagePercents = ['0.1', '0.5', '1'];

export default function RepayActionCard() {
  const {
    fromAddress,
    toAddress,
    setInputValue,
    slippagePercent,
    setSlippagePercent
  } = CollateralSwapContext.use();

  useMediaPreloader(SLIDES);

  const isFromAddressValid = isAddress(fromAddress);
  const isToAddressValid = isAddress(toAddress);

  const [isHelperModal, setIsHelperModal] = useState(false);

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
            title={'Meet the Repay'}
            slides={SLIDES}
          />
        }
        <RepayUnsupportedToken />
        <RepayInput onHelpClick={onHelpClick} />
        <div className={'collateral-swap-action-card__details'}>
          <RepayExchangeRate />
          <RepayCollateralRow />
          <RepayLoanRow />
          <div className={'collateral-swap-action-card__divider divider'}></div>
          <RepayRiskRow />
          <RepayHighRiskAlert />
          <RepaySwapRow />
          <RepayFlashloanFee />
          <RepayCompoundFee />
          <SlippageDropdown
            tooltipContent={'Slippage Tolerance is the maximum price difference allowed for your trade. If the asset’s price changes beyond this limit between confirmation and finalization on the blockchain, the transaction is canceled.'}
            slippagePercents={slippagePercents}
            value={slippagePercent}
            onChange={setSlippagePercent}
          />
          <RepaySlippageLowBanner />
          <RepayWithCollateralSendButton />
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
