import { useEffect, useState } from 'react';

export function useLocalStorage<T>(storageKey: string, defaultValue: T): [T, (value: T) => void] {
  const parse = (stored: string | null): T => {
    try {
      return JSON.parse(stored ?? 'null') ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(() => parse(window.localStorage.getItem(storageKey)));

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setValue(parse(event.newValue));
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  return [
    value,
    (newValue) => {
      window.localStorage.setItem(storageKey, JSON.stringify(newValue));
      setValue(newValue);
    },
  ];
}
