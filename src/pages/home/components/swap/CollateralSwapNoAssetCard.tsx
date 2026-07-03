export type PositionCardProps = {
  isFromCollateralSelected: boolean;
}

export default function CollateralSwapNoAssetCard(props: PositionCardProps) {
  const { isFromCollateralSelected } = props;

  return (
    <div className={'position-card position-card-no-asset panel'}>
      <div className={'position-card-no-asset__img'}></div>
      <p className={'position-card-no-asset__summary'}>
        {(() => {
          if (isFromCollateralSelected) {
            return 'Select a collateral you want to receive.';
          }

          return 'Select a collateral you want to swap.';
        })()}
      </p>
    </div>
  );
}
