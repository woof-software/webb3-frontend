import { useEffect, useRef } from 'react';

import { clamp } from '@helpers/numeric';

const MIN = 16;
const MAX = 32;

export type UseFontSizeFittingOptions = {
  /**
   * The minimum font size, in pixels, that should be used for the input.
   * Defaults to 16 pixels.
   */
  min?: number;
  /**
   * The maximum font size, in pixels, that should be used for the input.
   * Defaults to 32 pixels.
   */
  max?: number;
  /**
   * Proportional factor that determines the input width to be considered for font fitting.
   * Has to be the value between 0 and 1 where 1 is the full width of the input.
   */
  border?: number;
};

/**
 * Dynamically adjusts font size to fit an input element's width while
 * maintaining readability within specified constraints.
 *
 * @return A function that takes an HTMLInputElement and returns the optimal font size, in pixels, for the element's current content.
 */
export function useFontSizeFitting(opts?: UseFontSizeFittingOptions) {
  opts = opts ?? {};

  const {
    min = MIN,
    max = MAX
  } = opts;

  let {
    border = 1
  } = opts;

  border = clamp(border, 0, 1);

  const measureRef = useRef<HTMLSpanElement | null>(null);

  /**
   * The span element used for measuring text width. It has to be created before the returning callback is used.
   */
  useEffect(() => {
    const span = document.createElement('span');

    Object.assign(span.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre',
      left: '-9999px',
      top: '-9999px'
    });

    document.body.appendChild(span);

    measureRef.current = span;

    return () => {
      span.remove();
    };
  }, []);

  return (element: Element, value: string) => {
    const measure = measureRef.current;

    if (!measure) return;

    const computed = getComputedStyle(element);

    measure.style.fontFamily = computed.fontFamily;
    measure.style.fontWeight = computed.fontWeight;
    measure.style.letterSpacing = computed.letterSpacing;
    measure.style.padding = computed.padding;
    measure.style.fontSize = `${max}px`;
    measure.textContent = `${value}`;

    const inputWidth = element.clientWidth * border;

    // Binary search for optimal font size
    let low = min;
    let high = max;
    let best = min;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      measure.style.fontSize = `${mid}px`;

      if (measure.scrollWidth <= inputWidth) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return best;
  };
}

