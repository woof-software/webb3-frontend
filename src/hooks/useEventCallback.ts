import { useLayoutEffect, useMemo, useRef } from 'react';

/**
 * TODO: useEffectEvent analog until react version is less then 19.2 (has to be replaced with built-in after upgrade)
 * https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
 */

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

export function useEventCallback<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  const ref = useRef<Fn<A, R>>(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useMemo(() => (...args: A): R => {
    const { current } = ref;
    return current(...args);
  }, []);
}
