import BoostedSupplyRates from '@components/BoostedSupplyRates';
import NetRatesGraph, { NetRatesGraphType } from '@components/NetRatesGraph';
import PanelWithHeader from '@components/PanelWithHeader';
import { formatRateFactor } from '@helpers/numbers';
import { Token, StateType } from '@types';

import {
  getRewardsConfigForChain,
  getNetBorrowAPR,
  getNetSupplyAPR,
} from '../helpers/getRewardsData';

type MarketRatesPanelLoading = [StateType.Loading];

type MarketRatesPanelHydrated = [
  StateType.Hydrated,
  {
    chainId: number;
    marketAddress: string;
    borrowAPR: bigint;
    borrowRewardsAPR?: bigint;
    earnAPR: bigint;
    earnRewardsAPR?: bigint;
    rewardsAsset?: Token;
    // Set when earnRewardsAPR is an institutional market's USDC-terms program
    // reward, which annotates the net earn rate with a tooltip
    institutionalRewardsAPR?: bigint;
  }
];

export type MarketRatesPanelState = MarketRatesPanelLoading | MarketRatesPanelHydrated;

type PanelContent = {
  borrowAPR: bigint;
  borrowRewardsAPR?: bigint;
  earnAPR: bigint;
  earnRewardsAPR?: bigint;
  rewardsAsset?: Token;
  institutionalRewardsAPR?: bigint;
};

const defaultPanelContent: PanelContent = {
  borrowAPR: 0n,
  borrowRewardsAPR: undefined,
  earnAPR: 0n,
  earnRewardsAPR: undefined,
  rewardsAsset: undefined,
  institutionalRewardsAPR: undefined,
};

function getMarketRatesPanelContent(state: MarketRatesPanelState): PanelContent {
  const panelState = state[0];
  if (panelState === StateType.Loading) {
    return defaultPanelContent;
  }

  const { chainId, marketAddress, borrowAPR, borrowRewardsAPR, earnAPR, earnRewardsAPR, rewardsAsset } = state[1];

  const rewardConfig = getRewardsConfigForChain(chainId)[marketAddress.toLowerCase()];

  if (!rewardConfig) {
    return { borrowAPR, borrowRewardsAPR, earnAPR, earnRewardsAPR, rewardsAsset };
  }

  return {
    borrowAPR,
    earnAPR,
    borrowRewardsAPR: rewardConfig.borrowRewardsAPR,
    earnRewardsAPR: rewardConfig.supplyRewardsAPR,
    rewardsAsset,
  };
}

const MarketRatesPanel = ({ state }: { state: MarketRatesPanelState }) => {
  if (state[0] == StateType.Loading) {
    return <LoadingView />;
  } else {
    const panelContent = getMarketRatesPanelContent(state);
    return <MarketRatesPanelView {...panelContent} />;
  }
};

const LoadingView = () => {
  return (
    <>
      <PanelWithHeader header="Market Rates" className="grid-column--6">
        <div className="market-rates L2">
          <div className="market-rates__section grid-container grid-container--6">
            <div className="market-rates__section__labels-holder grid-column--2">
              <label className="label text-color--2">Net Borrow APR</label>
              <h4>
                <span className="placeholder-content" style={{ width: '4rem' }}></span>
              </h4>
            </div>
            <div className="grid-column--4">
              <h2>
                <span className="placeholder-content"></span>
              </h2>
            </div>
          </div>
          <div className="market-rates__section grid-container grid-container--6">
            <div className="market-rates__section__labels-holder grid-column--2">
              <label className="label text-color--2">Net Earn APR</label>
              <h4>
                <span className="placeholder-content" style={{ width: '4rem' }}></span>
              </h4>
            </div>
            <div className="grid-column--4">
              <h2>
                <span className="placeholder-content"></span>
              </h2>
            </div>
          </div>
        </div>
      </PanelWithHeader>
    </>
  );
};

const MarketRatesPanelView = ({
  borrowAPR,
  borrowRewardsAPR,
  earnAPR,
  earnRewardsAPR,
  rewardsAsset,
  institutionalRewardsAPR
}: PanelContent) => {
  const netBorrowAPR = getNetBorrowAPR(borrowAPR, borrowRewardsAPR);
  const netSupplyAPR = getNetSupplyAPR(earnAPR, earnRewardsAPR);

  const netBorrowRateGraph = (
    <NetRatesGraph
      state={NetRatesGraphType.Borrow}
      borrowAPR={borrowAPR}
    />
  );

  // Institutional markets show the base/boost breakdown bar; the whitelist
  // status renders as a standalone banner on the page instead of a card here
  const netEarnRateGraph =
    institutionalRewardsAPR !== undefined && institutionalRewardsAPR > 0n ? (
      <BoostedSupplyRates earnAPR={earnAPR} boostAPR={institutionalRewardsAPR} showWhitelistCard={false} />
    ) : (
      <NetRatesGraph
        state={NetRatesGraphType.Earn}
        earnAPR={earnAPR}
        earnRewardsAPR={earnRewardsAPR}
        rewardsAsset={rewardsAsset}
      />
    );

  return (
    <PanelWithHeader header="Market Rates" secondaryHeader="Net of Rewards" className="grid-column--6">
      <div className="market-rates L2">
        <div className="market-rates__section grid-container grid-container--6">
          <div className="market-rates__section__labels-holder grid-column--2">
            <label className="label text-color--2">Net Borrow APR</label>
            <h4 className="text-color--1 heading heading--emphasized L4">{formatRateFactor(netBorrowAPR)}</h4>
          </div>
          <div className="grid-column--4">{netBorrowRateGraph}</div>
        </div>
        <div className="market-rates__section grid-container grid-container--6">
          <div className="market-rates__section__labels-holder grid-column--2">
            <label className="label text-color--2">Net Earn APR</label>
            <h4 className="text-color--1 heading heading--emphasized L4">{formatRateFactor(netSupplyAPR)}</h4>
          </div>
          <div className="grid-column--4">{netEarnRateGraph}</div>
        </div>
      </div>
    </PanelWithHeader>
  );
};

export default MarketRatesPanel;
