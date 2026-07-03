import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import { clamp } from '@helpers/numeric';
import { useCollateralSwapPositionAffect } from '@hooks/collateral-swap/useCollateralSwapPositionAffect';
import { useCollateralSwapQuote } from '@hooks/collateral-swap/useCollateralSwapQuote';
import { useUserLtv } from '@hooks/leveraged-position/useUserLtv';

export const CollateralSwapActionCardRiskRow = () => {
  const { data: quoteData, isFetching } = useCollateralSwapQuote();

  const changes = useCollateralSwapPositionAffect();

  const ltvBefore = useUserLtv();
  const ltvAfter = useUserLtv({
    changes: changes
  });

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
          ? <span className="placeholder-content" style={{ width: '84px' }} />
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
