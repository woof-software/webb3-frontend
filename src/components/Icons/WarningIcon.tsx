import { clsx } from 'clsx';
import { ComponentProps } from 'react';

export type WarningIconProps = ComponentProps<'svg'>;

export const WarningIcon = (props: WarningIconProps) => {
  const {
    width = 16,
    height = 16,
    className,
    ...rest
  } = props;

  return (
    <svg
      className={clsx('svg', className)}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M1.33203 8.00033C1.33203 11.6822 4.3168 14.667 7.9987 14.667C11.6806 14.667 14.6654 11.6822 14.6654 8.00033C14.6654 4.31843 11.6806 1.33366 7.9987 1.33366C4.3168 1.33366 1.33203 4.31843 1.33203 8.00033ZM8.73944 8.74107C8.73944 9.15017 8.4078 9.48181 7.9987 9.48181C7.5896 9.48181 7.25796 9.15017 7.25796 8.74107V5.03736C7.25796 4.62826 7.5896 4.29662 7.9987 4.29662C8.4078 4.29662 8.73944 4.62826 8.73944 5.03736V8.74107ZM7.25796 10.9633C7.25796 10.5542 7.5896 10.2225 7.9987 10.2225C8.4078 10.2225 8.73944 10.5542 8.73944 10.9633C8.73944 11.3724 8.4078 11.704 7.9987 11.704C7.5896 11.704 7.25796 11.3724 7.25796 10.9633Z" />
    </svg>
  );
};
