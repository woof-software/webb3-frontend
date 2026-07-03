import {
  createContext,
  FC,
  useState,
  PropsWithChildren,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo
} from 'react';

import { usePlatformFee } from '@hooks/leveraged-position/usePlatformFee';

export type CollateralSwapContextModel = {
  /**
   * Change of the property has to start/end the user journey with the collateral swap feature
   */
  isActivated: boolean;
  setIsActivated: Dispatch<SetStateAction<boolean>>;
  fromAddress: string;
  setFromAddress: Dispatch<SetStateAction<string>>;
  toAddress: string;
  setToAddress: Dispatch<SetStateAction<string>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  /**
   * The slippage tolerance value from slippage dropdown
   */
  slippagePercent: string;
  setSlippagePercent: Dispatch<SetStateAction<string>>;
  platformFee: number;
};

const context = createContext<CollateralSwapContextModel | null>(null);

/**
 * React component wraps a passed node providing the context of the collateral swap feature.
 */
const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [fromAddress, _setFromAddress] = useState('');
  const [toAddress, _setToAddress] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [slippagePercent, setSlippagePercent] = useState<string>('0.1');

  const { setToAddress, setFromAddress } = useMemo(() => {
    return {
      setFromAddress: (value: SetStateAction<string>) => {
        _setFromAddress(value);
        setInputValue('');
      },
      setToAddress: (value: SetStateAction<string>) => {
        _setToAddress(value);
        setInputValue('');
      }
    };
  }, []);

  const { data: platformFee } = usePlatformFee();

  return (
    <context.Provider value={{
      isActivated,
      setIsActivated,
      fromAddress,
      setFromAddress,
      toAddress,
      setToAddress,
      inputValue,
      setInputValue,
      slippagePercent,
      setSlippagePercent,
      platformFee: platformFee ?? 0
    }}>
      {children}
    </context.Provider>
  );
};

/**
 * The "module" exports the context provider and the function of the context usage (as a hook).
 *
 * @example
 * ```
 * <App>
 *   <CollateralSwapContext.Provider>
 *     ...
 *   </CollateralSwapContext.Provider>
 * </App>
 * ```
 *
 * @example
 * ```
 * const ctx = CollateralSwapContext.use();
 * // throws an error if called outside the required context.
 * ```
 */
const CollateralSwapContext = {
  Provider,
  use: () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error('must be used within a CollateralSwapContext.Provider');
    }

    return ctx;
  }
};

export default CollateralSwapContext;
