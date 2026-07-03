import { clsx } from 'clsx';

import { CollateralSwapIcon } from '@components/Icons';

export type CollateralSwapButtonProps = {
  // Represents is button has focused styling (bordered box with expanded text)
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * A React component representing an activator of the user journey (collateral swap journey).
 *
 * The `CollateralSwapButton` is designed to display a button with dynamic styling
 * based on its `active` state. It supports an `onClick` callback for handling
 * user interactions. When inactive, the button shows an animated style, while
 * the active state applies a static appearance. Additionally, it includes an
 * associated icon and label.
 *
 * @param props - The properties passed to configure the component.
 * @param props.active - A boolean indicating whether the button is active (focused). Affects the button's styling.
 * @param props.disabled - A boolean indicating whether the button is disabled. Affects the button's styling.
 * @param props.onClick - A callback function triggered when the button is clicked.
 *
 * @returns The rendered CollateralSwapButton component.
 */
export const CollateralSwapButton = (props: CollateralSwapButtonProps) => {
  const { active, disabled, onClick } = props;

  return (
    <button
      className={clsx('button button--large', {
        'button--collateral-swap-animated': !active,
        'button--collateral-swap': active
      })}
      disabled={disabled}
      onClick={onClick}
    >
      <CollateralSwapIcon />
      <label className="label">Swap</label>
    </button>
  );
};
