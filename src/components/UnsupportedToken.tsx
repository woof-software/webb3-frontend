import { assetIconForAssetSymbol } from '@helpers/assets';

type UnsupportedToken = {
  symbol: string;
  name: string;
};

type UnsupportedTokenProps = {
  tokens: UnsupportedToken[];
};

export const UnsupportedToken = (props: UnsupportedTokenProps) => {
  const { tokens } = props;

  const title = `Unsupported ${tokens.length > 1 ? 'tokens' : 'token'} due to low ${tokens.length > 1 ? 'liquidity:' : 'liquidity'}`;

  return (
    <div className="unsupported-token">
      <div className="unsupported-token-content">
        <div className="unsupported-token-img" />

        <p className="unsupported-token-text unsupported-token-label">
          {title}
        </p>

        <div className="unsupported-token-assets">
          {tokens.map(({ symbol, name }) => (
            <div
              key={symbol}
              className="unsupported-token-assets-row"
            >
              <span
                className={`asset unsupported-token-asset asset--${assetIconForAssetSymbol(symbol)}`}
              />
              <p className="unsupported-token-text unsupported-token-asset-label">
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
