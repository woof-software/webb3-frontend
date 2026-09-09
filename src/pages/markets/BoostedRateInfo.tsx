import { Lightning } from '@components/Icons/Lightning';
import Tooltip from '@components/Tooltip';
import NetRatesTooltip, { NetRatesTooltipView } from '@components/Tooltips/NetRatesTooltip';
import { Token } from '@types';

interface BoostedRateInfoProps {
  view: NetRatesTooltipView;
  borrowAPR?: bigint;
  earnAPR?: bigint;
  earnRewardsAPR?: bigint;
  borrowRewardsAPR?: bigint;
  rewardsAsset?: Token;
}

export const BoostedRateInfo = (props: BoostedRateInfoProps) => {
  const {
    view,
    earnAPR = 0n,
    earnRewardsAPR = 0n,
    borrowRewardsAPR = 0n,
    borrowAPR = 0n,
    rewardsAsset,
  } = props;

  return (
    <Tooltip
      width={400}
      hideArrow={true}
      interactive={true}
      yOffset={12}
      content={
        <NetRatesTooltip
          borrowAPR={borrowAPR}
          earnAPR={earnAPR}
          earnRewardsAPR={earnRewardsAPR}
          borrowRewardsAPR={borrowRewardsAPR}
          rewardsAsset={rewardsAsset}
          view={view}
        />
      }
    >
      <span onClick={(e) => e.stopPropagation()}>
        <Lightning/>
      </span>
    </Tooltip>
  );
};