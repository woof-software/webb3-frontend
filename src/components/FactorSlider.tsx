import { clsx } from 'clsx';
import React, { useEffect, useId, useState } from 'react';

import LeveragedPositionContext from '@contexts/LeveragedPositionContext';
import { noop } from '@helpers/functions';
import { clamp } from '@helpers/numeric';
import { spawnFloatRegex } from '@helpers/regex';

export type FactorSliderProps = {
  /** A number specifying the maximum value for the slider. Defaults to zero or the minimum limit if provided. */
  max?: number;

  /** A number defining the total marks to be positioned along the slider. Default is `5`. */
  numberOfMarks?: number;

  /** A number specifying the incremental step for the slider. Defaults to `0.01`. */
  step?: number;

  /** A default numeric value for the slider to initialize with. Defaults to the minimum limit. */
  value?: number;

  /** A string representing the label displayed next to the slider input field. Default is "Multiplier". */
  label?: string;

  /** A callback function invoked whenever the slider or input field value is updated. Default is a no-op function. */
  onChange?: (value: number) => void;

  /**
   * A boolean indicating whether the slider is disabled. Default is `false`.
   *
   * Slider may become disabled by internal conditions, but if the flag is passed,
   * it will overwrite the internal state. But if the flag is `false`, it will not
   * change the state.
   */
  disabled?: boolean;
}

const MIN = 1;

/** Utils to adjust the brightness of the mark's color depended on the distance between the mark and selected value. */
const useMarkColor = () => {
  /** Linearly interpolates between two values. */
  const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  };

  /**
   * Blend two RGB colors with a given factor.
   *
   * @param base - The starting color [r, g, b]
   * @param target - The target color [r, g, b]
   * @param factor - Blend factor (0 = base, 1 = target)
   */
  const blendColors = (
    base: [number, number, number],
    target: [number, number, number],
    factor: number
  ): string => {
    const [r, g, b] = base.map((c, i) => Math.round(lerp(c, target[i], factor)));
    return `rgb(${r}, ${g}, ${b})`;
  };

  /**
   * Get a normalized factor based on how close a value is to a mark.
   *
   * @param mark - Reference point
   * @param value - Current value
   * @param limit - Maximum distance for non-zero factor
   * @returns Factor in [0,1]
   */
  const getProximityFactor = (
    mark: number,
    value: number,
    limit = 1
  ): number => {
    const distance = Math.abs(mark - value);
    if (distance >= limit) return 0;
    return 1 - distance / limit;
  };

  return {
    blendColors,
    getProximityFactor
  };
};

/**
 * A React functional component that represents an interactive slider for setting numeric factors or multipliers.
 *
 * This component includes a slider control, an input field for manual numeric entry, and optional predefined marks
 * along the slider. It supports real-time changes, dynamic configuration via props, and enables users to interact
 * with the slider or input field to choose or enter a desired numeric value.
 *
 * The component checks and enforces valid ranges for input values, applies formatting to values, and adjusts
 * dynamically based on the provided limits and number of marks.
 *
 * Behavior:
 * - If the `max` prop is less than or equal to the minimum limit, the component disables the slider and marks.
 * - If `numberOfMarks` is less than 2 or there can't be rendered at least 2 marks, then it doesn't render marks at all.
 * - Automatically adjusts invalid input values to within the allowed range (triggering callback from props).
 * - Dynamically calculates the positions and values of the marks based on the `max` and `numberOfMarks`.
 * - Provides visual feedback for invalid text input via styles (e.g., input field highlighting for errors).
 * - Users can interact either via the slider, clicking on marks, or directly typing in the input field.
 */
export const FactorSlider: React.FC<FactorSliderProps> = (props) => {
  const {
    label = 'Multiplier',
    numberOfMarks = 5,
    value = MIN,
    onChange = noop,
    disabled = false
  } = props;

  let {
    max = 0,
    step = 0.01
  } = props;

  const { theme: currentTheme } = LeveragedPositionContext.use();

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const sliderMarksInterpolationColor: [number, number, number] = currentTheme === 'Light' ? [23, 33, 43] : [255, 255, 255];

  max = max > MIN ? max : MIN;
  step = step <= 0 ? 0.01 : step;

  const markStep = max / numberOfMarks;

  const marks: number[] = (() => {
    if (numberOfMarks < 2) return [1]; // edge case: only start

    const step = (max - 1) / (numberOfMarks - 1);

    return Array.from({ length: numberOfMarks }, (_, i) => +((1 + i * step).toFixed(2)));
  })();

  let isDisabled = max <= MIN || numberOfMarks <= 1;

  if (disabled) {
    isDisabled = true;
  }

  // Reset to minimum value if marks are removed
  useEffect(() => {
    if (marks.length > 1) return;

    setInputValue(`${MIN}`);
    onChange(MIN);
  }, [marks.length]);

  const id = useId();

  const [inputValue, setInputValue] = useState<string>(`${value}`);

  useEffect(() => {
    if (value !== 0) {
      setInputValue(`${value}`);
    }
  }, [value]);

  const {
    blendColors,
    getProximityFactor
  } = useMarkColor();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setInputValue(`${newValue}`);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;

    const m = spawnFloatRegex(2, 2).exec(value);

    if (m === null || m[0] !== value) {
      if (value.startsWith('0') && !Number.isNaN(+value[1])) {
        value = value[1];
      } else {
        return;
      }
    }

    onChange(+value);
    setInputValue(value);
  };

  const isInputError = (() => {
    const inputValueAsN = +inputValue;

    if (Number.isNaN(inputValueAsN)) return false;

    return inputValueAsN < MIN || inputValueAsN > max;
  })();

  const onBlur = () => {
    setIsFocused(false);
    setInputValue(`${clamp(+inputValue, MIN, max)}`);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  const onMarkClick = (value: number) => {
    onChange(value);
    setInputValue(`${value}`);
  };

  const spawnMarkClickHandler = (mark: number) => {
    return () => {
      onMarkClick(mark);
    };
  };

  return (
    <div className="multiplier-slider">
      <div className="multiplier-slider__header">
        <label htmlFor={`${id}-input`} className="multiplier-slider__label">{label}</label>
        <input
          id={`${id}-input`}
          className={clsx('multiplier-slider__input', {
            'multiplier-slider__input--error': isInputError
          })}
          disabled={isDisabled}
          value={isFocused ? inputValue : `${inputValue}x`}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete="off"
        />
      </div>
      <div className="multiplier-slider__range-container">
        <input
          id={`${id}-range`}
          className="multiplier-slider__range"
          type="range"
          disabled={isDisabled}
          min={MIN}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
        />
      </div>
      {
        (max > MIN && numberOfMarks > 1) && <div className="multiplier-slider__marks">
          {marks.map((mark) => {
            const factor = getProximityFactor(mark, value, markStep);

            const color = blendColors([122, 137, 154], sliderMarksInterpolationColor, factor);

            return (
              <button
                key={mark}
                className="multiplier-slider__mark"
                style={{ color }}
                disabled={isDisabled}
                onClick={spawnMarkClickHandler(mark)}
              >
                {mark}x
              </button>
            );
          })}
        </div>
      }
    </div>
  );
};
