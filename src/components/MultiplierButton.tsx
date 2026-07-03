import { clsx } from 'clsx';

import { MultiplierIcon } from '@components/Icons/MultiplierIcon';

export type MultiplierButtonProps = {
  // Represents is button has focused styling (bordered box with expanded text)
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * A React component representing an activator of the user journey (Multiplier journey).
 *
 * The `MultiplierButton` is designed to display a button with dynamic styling
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
 * @returns The rendered MultiplierButton component.
 */
export const MultiplierButton = (props: MultiplierButtonProps) => {
  const { active, disabled, onClick } = props;

  return (
    <button
      className={clsx('button button--large', {
        'button--multiplier-animated': !active,
        'button--multiplier': active
      })}
      disabled={disabled}
      onClick={onClick}
    >
      <MultiplierIcon width={16} />
      <label className="label">Multiplier</label>
    </button>
  );
};
