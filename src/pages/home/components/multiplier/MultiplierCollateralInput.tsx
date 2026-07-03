import { clsx } from 'clsx';
import { ChangeEvent, FC, MouseEvent, useEffect, useId, useRef, useState } from 'react';

import { InfoSolid } from '@components/Icons';
import { assetIconForAssetSymbol } from '@helpers/assets';
import { noop } from '@helpers/functions';
import { spawnFloatRegex } from '@helpers/regex';
import { useFontSizeFitting } from '@hooks/useFontSizeFitting';

export type CollateralInputProps = {
  symbol: string;
  value: string;
  error?: string;
  disabled?: boolean;
  availablePrefix?: string;
  decimals?: number;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onHelpClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMaxClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const DEFAULT_INTEGER_PART_LENGTH = 18;
const DEFAULT_DECIMAL_PART_LENGTH = 18;

export const MultiplierCollateralInput: FC<CollateralInputProps> = (props) => {
  const {
    symbol,
    value,
    error,
    availablePrefix = '0',
    disabled = false,
    decimals = DEFAULT_DECIMAL_PART_LENGTH,
    onHelpClick = noop,
    onChange = noop,
    onMaxClick = noop
  } = props;

  const id = useId();

  const inputRef = useRef<HTMLInputElement>(null);

  const getInputFontSize = useFontSizeFitting({
    border: 0.85
  });

  const [adjustedFontSize, setAdjustedFontSize] = useState<number>();

  useEffect(() => {
    const input = inputRef.current;

    if (!input) return;

    const fontSize = getInputFontSize(input, input.value);

    setAdjustedFontSize(fontSize);
  }, [value]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');

    const regex = spawnFloatRegex(DEFAULT_INTEGER_PART_LENGTH, decimals);

    const m = regex.exec(value);

    if (m === null || m[0] !== value) {
      if (value.startsWith('0') && !Number.isNaN(+value[1])) {
        value = value[1];
      } else {
        e.preventDefault();
        e.stopPropagation();

        return;
      }
    }

    onChange(value, e);
  };

  const setInputInFocus = () => {
    const inputElement = document.getElementById(`input-${id}`) as HTMLInputElement;

    if (inputElement) {
      inputElement.focus();
    }
  };

  const _onHelpClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    onHelpClick(e);
  };

  const _onMaxClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    onMaxClick(e);
  };

  return (
    <div
      className="multiplier-collateral-input"
      onClick={setInputInFocus}
    >
      <div className="heading">
        <div className="heading__info-block">
          <p className={clsx('heading__text label L2', {
            'heading__text--error': !!error
          })}>Supply {symbol}</p>
          {error && <p className="label L2 text-color--2">{error}</p>}
        </div>
        <button
          className="heading__hint-button button button--plain"
          onClick={_onHelpClick}
        >
          <InfoSolid />
        </button>
      </div>
      <div className="field">
        <input
          ref={inputRef}
          id={`input-${id}`}
          className="field__input"
          placeholder="0"
          autoComplete="off"
          style={{ fontSize: `${adjustedFontSize}px` }}
          value={value}
          onChange={onInputChange}
          disabled={disabled}
        />
        <button
          className="field__max-button button button--small"
          disabled={disabled}
          onClick={_onMaxClick}
        >
          Max
        </button>
      </div>
      <div className="available-row">
        <div className={clsx('available-row__token asset', `asset--${assetIconForAssetSymbol(symbol)}`)}></div>
        <p className="available-row__text L4 meta">{availablePrefix} Available</p>
      </div>
    </div>
  );
};
