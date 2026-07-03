import { useEffect, useState, JSX } from 'react';

import { useEventCallback } from '@hooks/useEventCallback';

export type CounterProps = {
  end: number;
  render: (value: number) => JSX.Element;
  /**
   * The callback will be applied to each calculation of the time difference between the current time and the end. The
   * result is used as the next value. The developer can go into an infinite loop by using logically incorrect rounding
   * (ex. returning a constant value, etc.). So be careful, use it at your own risk.
   */
  unsafeRound?: (value: number) => number;
}

/**
 * It is a real-time countdown component that calculates “milliseconds left until end”
 * on every animation frame and passes that value into a user-provided render function.
 *
 * Counter is a countdown timer that counts down in real time (per animation frame) from
 * “now” until a given future timestamp (the `end` = a UNIX ms timestamp).
 *
 * It does not display itself — instead it exposes the current countdown value (remaining
 * milliseconds) to the UI through a render-prop.
 *
 * Step-by-step logic flow
 * 1. Component receives:
 *    - `end` — a timestamp in future (ms), optional
 *    - `render(value)` — a function that renders UI based on the current value
 * 2. When the component mounts or when the `end` changes:
 *    - If the `end` is not provided → do nothing
 *    - If provided → start frame loop with requestAnimationFrame
 * 3. On each animation frame:
 *    - Calculate a `difference` between `now` and the `end`
 *    - Update component state with a new ` difference `
 * 4. On unmounting — cancel the animation frame.
 * 5. In the render step:
 *    - component calls render(currentValue) and returns the result
 *    - if value is not set yet → it defaults to 0
 *
 * @example
 * If the `end` is “3 seconds in the future” — then the value will be (depending on the engine availability):
 *
 * ≈ render(2999, 2967, 2921, ... 0)
 */
export function Counter(props: CounterProps) {
  const {
    end,
    render,
    unsafeRound = (v) => v
  } = props;

  const _unsafeRound = useEventCallback(unsafeRound);

  const [value, setValue] = useState<number>();

  useEffect(() => {
    if (!end) return;

    let id: number;

    const iterate = () => {
      const now = Date.now();

      const tillTheEnd = _unsafeRound(end - now);

      setValue(Math.max(tillTheEnd, 0));

      if (tillTheEnd <= 0) return;

      id = requestAnimationFrame(iterate);
    };

    id = requestAnimationFrame(iterate);

    return () => {
      cancelAnimationFrame(id);
    };
  }, [end]);

  return value === undefined ? null : render(value);
}