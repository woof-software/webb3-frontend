import { clsx } from 'clsx';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { CustomTooltip } from '@components/CustomTooltip';
import { CaretDown, InfoSolid } from '@components/Icons';
import { WarningAlert } from '@components/WarningAlert';
import { spawnFloatRegex } from '@helpers/regex';

export interface SlippageDropdownProps {
  slippagePercents: string[];
  value: string;
  tooltipContent?: string;
  onChange: (value: string, e?: ChangeEvent<HTMLInputElement>) => void;
}

export const SlippageDropdown = (props: SlippageDropdownProps) => {
  const {
    value,
    slippagePercents,
    onChange,
    tooltipContent = ''
  } = props;
  const [isDropdown, setIsDropdown] = useState<boolean>(false);
  const [isWarning, setIsWarning] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Should reset value on dropdown close if it's not a preset value
  {
    const isEmptyValue = !+value;

    if (!isDropdown) {
      if (isEmptyValue) {
        value !== slippagePercents[0] && onChange(slippagePercents[0]);
      } else {
        value !== `${+value}` && onChange(`${+value}`);
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdown(false);
      }
    };

    if (isDropdown) {
      document.addEventListener('mouseup', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [isDropdown, value]);

  useEffect(() => {
    onChange(slippagePercents[0]);
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsWarning(false);

    let value = e.target.value.replace(/[^0-9.]/g, '');

    if (+value > 1) {
      setIsWarning(true);
    }

    if (+value > 50) {
      value = '50';
      onChange(value, e);
      return;
    }

    const regex = spawnFloatRegex(2, 2);

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

  const handleTriggerClick = () => {
    setIsDropdown(prev => !prev);
  };

  const handlePresetClick = (presetValue: string) => {
    setIsWarning(false);
    onChange(presetValue);
  };

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div ref={dropdownRef}>
      <div className="slippage-dropdown-trigger-container">
        <span className="slippage-dropdown-label">Slippage tolerance</span>
        <div className="slippage-dropdown-trigger-container__buttons">
          <button
            onClick={handleTriggerClick}
            className="slippage-dropdown-trigger"
          >
            {value}%
            <CaretDown className={clsx(`slippage-dropdown-trigger__chevron`, {
              'slippage-dropdown-trigger__chevron--active': isDropdown
            })} />
          </button>
          <CustomTooltip
            content={tooltipContent}
            className="slippage-dropdown-tooltip label"
          >
            <InfoSolid className="slippage-dropdown-info-icon heading__hint-button button button--plain" />
          </CustomTooltip>
        </div>
      </div>
      {isDropdown && (
        <div className="slippage-dropdown">
          <div className="slippage-dropdown__buttons">
            {slippagePercents.map((presetValue) => (
              <button
                key={`${presetValue}-slippage-dropdown-button`}
                onClick={() => handlePresetClick(presetValue)}
                className={`slippage-dropdown__button${value === presetValue ? ' slippage-dropdown__button--active' : ''}`}>
                {presetValue}%
              </button>
            ))}
          </div>
          <div className="slippage-dropdown-divider"></div>
          <form onSubmit={handleSubmit}>
            <input
              autoComplete="off"
              className="slippage-dropdown__input"
              value={value}
              onChange={onInputChange}
              placeholder="Enter Slippage"
              inputMode="numeric"
            />
          </form>
        </div>
      )}
      <p className={clsx('slippage-dropdown-message', {
        'slippage-dropdown-message-with-margin': isDropdown
      })}>
        Slippage may be higher for illiquid pairs. Increase slippage tolerance if the transaction fails.
      </p>
      {isWarning && (
        <WarningAlert className="slippage-dropdown-alert">
          Slippage tolerance above 1% could lead to an unfavorable rate.
        </WarningAlert>
      )}
    </div>
  );
};