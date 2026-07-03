import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import { clamp } from '@helpers/numeric';
import { useUserLtv } from '@hooks/leveraged-position/useUserLtv';
import { useCollateralRepayPositionAffect } from '@hooks/repay/useCollateralRepayPositionAffect';
import { useCollateralRepayQuote } from '@hooks/repay/useCollateralRepayQuote';

export const RepayRiskRow = () => {
  const { data: quoteData, isFetching } = useCollateralRepayQuote();

  const changes = useCollateralRepayPositionAffect();

  const ltvBefore = useUserLtv();
  const ltvAfter = useUserLtv({ changes });

  if (!ltvBefore && !ltvAfter) {
    return null;
  }

  const percentBefore = `${clamp(Math.abs(ltvBefore), 0, 100)}%`;
  const percentAfter = `${clamp(Math.abs(ltvAfter), 0, 100)}%`;

  return (
    <ActionCardRow
      title={'Liquidation Risk'}
      info={
        isFetching
          ? <span className="placeholder-content" style={{ width: '84px' }}></span>
          : (
            <>
              <span>{!ltvBefore && ltvAfter ? '0%' : percentBefore}</span>
              {(percentBefore !== percentAfter && quoteData) && (
                <>
                  <ArrowRight />
                  <span>
                    {percentAfter}
                  </span>
                </>
              )}
            </>
          )
      }
    />
  );
};