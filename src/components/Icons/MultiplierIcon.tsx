import { clsx } from 'clsx';
import { ComponentProps } from 'react';

export type MultiplierIconProps = ComponentProps<'svg'>;

export const MultiplierIcon = (props: MultiplierIconProps) => {
  const {
    width = 24,
    height = 24,
    className,
    ...rest
  } = props;

  return (
    <svg
      width={width}
      height={height}
      className={clsx('svg', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M7 7.375L6 8.25L4 10L12 17L20 10L18 8.25L17 7.375" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13.5L12 21L20.5 13.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11.8464V3M12 3L15 5.5M12 3L9 5.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
