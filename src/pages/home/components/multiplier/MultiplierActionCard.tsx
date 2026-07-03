import { useEffect, useState } from 'react';
import { formatEther, formatUnits } from 'viem';

import { FactorSlider } from '@components/FactorSlider';
import { HelperModal, Slide, SlideWithMedia } from '@components/HelperModal';
import { SlippageDropdown } from '@components/SlippageDropdown';
import MultiplierContext from '@contexts/MultiplierContext';
import { formatValue } from '@helpers/numbers';
import { useMarketCollateral } from '@hooks/leveraged-position/useMarketCollateral';
import { useMultiplierInputValidation } from '@hooks/multiplier/useMultiplierInputValidation';
import { useMediaPreloader } from '@hooks/useMediaPreloader';

import { MultiplierCollateralInput } from './MultiplierCollateralInput';
import { MultiplierCollateralRow } from './MultiplierCollateralRow';
import { MultiplierCompoundFeeRow } from './MultiplierCompoundFeeRow';
import { MultiplierExchangeRate } from './MultiplierExchangeRate';
import { MultiplierFlashLoanRow } from './MultiplierFlashLoanRow';
import { MultiplierHighRiskBanner } from './MultiplierHighRiskBanner';
import { MultiplierPositionRow } from './MultiplierPositionRow';
import { MultiplierRiskRow } from './MultiplierRiskRow';
import { MultiplierSendButton } from './MultiplierSendButton';
import { MultiplierSlippageLowBanner } from './MultiplierSlippageLowBanner';
import { MultiplierSwapRow } from './MultiplierSwapRow';
import { MultiplierUnsupportedToken } from './MultiplierUnsupportedToken';

const SLIDES: Array<Slide | SlideWithMedia> = [
  {
    id: 'multiplier-slide-1',
    title: '',
    description: 'Need a loan but short on funds to secure one? With Multiplier, you can access the loan amount you need more efficiently.',
    duration: 3,
    mediaType: 'img',
    url: `${window.location.origin}/images/multiplier-preview.avif?v=1`
  },
  {
    id: 'multiplier-slide-2',
    title: '',
    description: 'Simply choose your preferred collateral, activate the Multiplier feature, and unlock higher loan limits without the stress of insufficient collateral. Empower your borrowing potential—quickly and easily.',
    duration: 3,
    mediaType: 'video',
    url: `${window.location.origin}/videos/multiplier-preview.av1?v=1`
  }
];

const slippagePercents = ['0.1', '0.5', '1'];

export const MultiplierActionCard = () => {
  const {
    multiplierValue,
    setMultiplierValue,
    collateral,
    supply,
    setSupply,
    slippagePercent,
    setSlippagePercent
  } = MultiplierContext.use();

  const [isHelperModal, setIsHelperModal] = useState(false);

  const collateralInfo = useMarketCollateral(collateral);

  useMediaPreloader(SLIDES);

  const {
    collateralFactor,
    walletBalance = 0n,
    decimals = 0,
    symbol: collateralSymbol = ''
  } = collateralInfo ?? {};

  const error = useMultiplierInputValidation();

  const availableBalance = formatValue(decimals, walletBalance);

  const formattedCollateralFactor = +(1 / (1 - +formatEther(collateralFactor ?? 0n)) * (1 - 0.01)).toFixed(2);

  useEffect(() => {
    setMultiplierValue(formattedCollateralFactor);
  }, [collateral]);

  const onMaxClick = () => {
    setSupply(formatUnits(walletBalance, decimals));
  };

  const handleHelperModalClose = () => {
    setIsHelperModal(false);
  };

  const onHelpClick = () => {
    setIsHelperModal(true);
  };

  return (
    <div className={'multiplier-action-card'}>
      {isHelperModal &&
        <HelperModal
          handleClose={handleHelperModalClose}
          title={'Meet the Multiplier'}
          slides={SLIDES}
        />
      }
      <MultiplierUnsupportedToken/>
      <MultiplierCollateralInput
        onHelpClick={onHelpClick}
        onMaxClick={onMaxClick}
        availablePrefix={availableBalance}
        symbol={collateralSymbol}
        value={supply}
        onChange={setSupply}
        error={error}
      />
      <div className={'multiplier-action-card__details'}>
        <FactorSlider
          value={multiplierValue}
          max={formattedCollateralFactor}
          numberOfMarks={5}
          step={0.01}
          disabled={!+supply}
          onChange={setMultiplierValue}
        />
        <div className={'multiplier-action-card-summary__divider divider'}></div>
        <MultiplierExchangeRate />
        <MultiplierCollateralRow />
        <MultiplierPositionRow />
        <div className={'multiplier-action-card-summary__divider divider'}></div>
        <MultiplierRiskRow />
        <MultiplierHighRiskBanner />
        <MultiplierSwapRow />
        <MultiplierFlashLoanRow />
        <MultiplierCompoundFeeRow />
        <SlippageDropdown
          tooltipContent={'Slippage Tolerance is the maximum price difference allowed for your trade. If the asset’s price changes beyond this limit between confirmation and finalization on the blockchain, the transaction is canceled.'}
          slippagePercents={slippagePercents}
          value={slippagePercent}
          onChange={setSlippagePercent}
        />
        <MultiplierSlippageLowBanner />
        <MultiplierSendButton />
      </div>
    </div>
  );
};