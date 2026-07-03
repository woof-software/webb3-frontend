import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

import { WarningIcon } from '@components/Icons';

export interface WarningAlertProps extends PropsWithChildren {
  className?: string;
}

export const WarningAlert = (props: WarningAlertProps) => {
  const {
    children,
    className = ''
  } = props;

  return (
    <div
      className={clsx(`alert-container alert-container__warning`, className)}
      role="alert"
    >
      <WarningIcon />
      <p className="alert-container-content">
        {children}
      </p>
    </div>
  );
};