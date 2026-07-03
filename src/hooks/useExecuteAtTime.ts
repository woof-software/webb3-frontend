import { useEffect, useRef } from 'react';

/**
 * Use this hook if you need to execute some code at a specified
 * time. Relies on the time comparison which is executed on each
 * frame it runs user callback if the component has not been
 * unmounted before.
 *
 * Keypoints:
 *  - You can update the cb function after the hook is initialized.
 *  - The loop will not break if the `callback` changes.
 *  - The loop will break if `executionTimestampMs` changes.
 *
 * @example
 * // let `now` be January 1, 1970 12:00:00 AM
 *
 * useExecuteAtTime(() => { console.log('hello') }, 1000) // January 1, 1970 12:00:01 AM
 *
 * // When the time became January 1, 1970 12:00:01 AM you will see `hello` in the console.
 */
export function useExecuteAtTime(callback: () => void, executionTimestampMs?: number) {
  const safeCallback = useRef(callback);

  safeCallback.current = callback;

  useEffect(() => {
    if (!executionTimestampMs) return;

    let id: number;

    const iterate = () => {
      const now = Date.now();

      const tillTheEnd = executionTimestampMs - now;

      if (tillTheEnd <= 0) {
        safeCallback.current();
      }

      id = requestAnimationFrame(iterate);
    };

    id = requestAnimationFrame(iterate);

    return () => {
      cancelAnimationFrame(id);
    };
  }, [executionTimestampMs]);
}
