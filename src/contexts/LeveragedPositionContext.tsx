import { createContext, FC, PropsWithChildren, useContext } from 'react';

import { Theme } from '@hooks/useThemeManager';
import { AddTransaction } from '@hooks/useTransactionManager';
import { CometState } from '@types';

/**
 * LeveragedPositionContext is a high-level shared context that represents
 * the current leveraged position state in the application.
 *
 * It acts as an architectural wrapper over feature-specific contexts
 * such as Multiplier and CollateralSwap, providing them with a common
 * set of dependencies (theme, cometState, addTransaction).
 *
 * This context reflects the current application architecture where
 * shared props are passed top-down through a single root context,
 * ensuring consistency and avoiding duplicated prop wiring across
 * leveraged position-related flows.
 */

export type LeveragedPositionContextModel = {
  cometState: CometState
  addTransaction: AddTransaction
  theme: Theme
};

type ProviderProps = PropsWithChildren<LeveragedPositionContextModel>;

const context = createContext<LeveragedPositionContextModel | null>(null);

const Provider: FC<ProviderProps> = (props) => {
  const { children, theme, cometState, addTransaction } = props;

  return <context.Provider value={{
    theme,
    cometState,
    addTransaction
  }}>
    {children}
  </context.Provider>;
};

const LeveragedPositionContext = {
  Provider,
  use: () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error('must be used within a LeveragedPositionContext.Provider');
    }

    return ctx;
  }
};

export default LeveragedPositionContext;
