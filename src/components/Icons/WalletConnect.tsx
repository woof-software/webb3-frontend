import walletConnect from '../../assets/wallets/walletconnect.webp';

export const WalletConnect = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      fill="none"
      className={`svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 32 32"
    >
      <rect width="32" height="32" fill="url(#pattern-walletconnect)"></rect>
      <defs>
        <pattern id="pattern-walletconnect" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_660_2005" transform="scale(0.00195312)"></use>
        </pattern>
        <image id="image0_660_2005" width="512" height="512" xlinkHref={walletConnect}></image>
      </defs>
    </svg>
  );
};
