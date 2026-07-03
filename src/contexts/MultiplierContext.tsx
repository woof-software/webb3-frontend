import { createContext, FC, useState, PropsWithChildren, Dispatch, SetStateAction, useContext, useEffect } from 'react';

import { usePlatformFee } from '@hooks/leveraged-position/usePlatformFee';

export type MultiplierContextModel = {
  /**
   * Change of the property has to start/end the user journey with the multiplier feature. (Handle 'Multiplier' button
   * state, collaterals view, etc.)
   */
  isActivated: boolean;
  setIsActivated: Dispatch<SetStateAction<boolean>>;

  /**
   * The collateral used during the user journey.
   */
  collateral: string | null;
  setCollateral: Dispatch<SetStateAction<string | null>>;

  /**
   * The multiplier used during the user journey.
   */
  multiplierValue: number;
  setMultiplierValue: Dispatch<SetStateAction<number>>;

  /**
   * The supply value from supply arb input
   */
  supply: string;
  setSupply: Dispatch<SetStateAction<string>>;

  /**
   * The slippage tolerance value from slippage dropdown
   */
  slippagePercent: string
  setSlippagePercent: Dispatch<SetStateAction<string>>;
  platformFee: number;
};

const context = createContext<MultiplierContextModel | null>(null);

/**
 * React component wraps a passed node providing the context of the multiplier feature.
 *
 * Includes:
 * - Journey status;
 */
const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [collateral, setCollateral] = useState<string | null>(null);
  const [multiplierValue, setMultiplierValue] = useState<number>(1);
  const [supply, setSupply] = useState<string>('');
  const [slippagePercent, setSlippagePercent] = useState<string>('0.1');

  // Reset the selected asset if the Multiplier is closed
  useEffect(() => {
    if (isActivated) return;

    setCollateral(null);
  }, [isActivated]);

  // Reset user inputs when the collateral changes
  useEffect(() => {
    setSupply('');
    setMultiplierValue(1);
    setSlippagePercent('0.1');
  }, [collateral]);

  const { data: platformFee } = usePlatformFee()

  return <context.Provider value={{
    supply,
    setSupply,
    slippagePercent,
    setSlippagePercent,
    multiplierValue,
    setMultiplierValue,
    isActivated,
    setIsActivated,
    collateral,
    setCollateral,
    platformFee: platformFee ?? 0
  }}>
    {children}
  </context.Provider>;
};

/**
 * The "module" exports the context provider and the function of the context usage (as a hook).
 *
 * @example
 * ```
 * <App>
 *   <MultiplierContext.Provider>
 *     ...
 *   </MultiplierContext.Provider> 
 * </App>
 * ```
 *
 * @example
 * ```
 * const ctx = MultiplierContext.use();
 * // throws an error if called outside of the required context.
 * ```
 */
const MultiplierContext = {
  Provider,
  use: () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error('must be used within a MultiplierContext.Provider');
    }

    return ctx;
  }
};

export default MultiplierContext;
