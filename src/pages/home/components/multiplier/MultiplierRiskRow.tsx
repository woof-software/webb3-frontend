import { ActionCardRow } from '@components/ActionCardRow';
import { ArrowRight } from '@components/Icons';
import { clamp } from '@helpers/numeric';
import { useUserLtv } from '@hooks/leveraged-position/useUserLtv';
import { useMultiplierEffect } from '@hooks/multiplier/useMultiplierEffect';
import { useMultiplierQuote } from '@hooks/multiplier/useMultiplierQuote';

export const MultiplierRiskRow = () => {
  const { data: quoteData, isFetching: isFetching } = useMultiplierQuote();

  const changes = useMultiplierEffect();

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
                  <ArrowRight className={'multiplier-action-card-summary__row-arrow'} />
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