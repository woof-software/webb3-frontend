export const PositionCardNoAsset = () => {
  return (
    <div className={'position-card position-card-no-asset panel'}>
      <div className={'position-card-no-asset__img'}></div>
      <p className={'position-card-no-asset__summary'}>
        No asset selected. Please choose a collateral on the left to see its details and available actions.
      </p>
    </div>
  );
};