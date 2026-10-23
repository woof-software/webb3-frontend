import { useState } from 'react';

export function useShowTopCollateralOnly(storageKey: string): [boolean, () => void] {
  const [showTopCollateralOnly, setShowTopCollateralOnly] = useState(
    () => window.localStorage.getItem(storageKey) !== 'false'
  );

  const toggle = () => {
    window.localStorage.setItem(storageKey, String(!showTopCollateralOnly));
    setShowTopCollateralOnly(!showTopCollateralOnly);
  };

  return [showTopCollateralOnly, toggle];
}
