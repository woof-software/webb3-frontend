import ledger from '../../assets/wallets/ledger.webp';

export const LedgerWallet = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      fill="none"
      className={`svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 32 32"
    >
      <rect width="32" height="32" fill="url(#pattern-ledger)"></rect>{' '}
      <defs>
        <pattern id="pattern-ledger" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_660_2014" transform="scale(0.0025)"></use>{' '}
        </pattern>
        <image id="image0_660_2014" width="400" height="400" xlinkHref={ledger}></image>
      </defs>
    </svg>
  );
};
