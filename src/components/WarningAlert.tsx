import { clsx } from 'clsx';
import { PropsWithChildren, MouseEventHandler } from 'react';

import { WarningIcon } from '@components/Icons';
import { noop } from '@helpers/functions';

export interface WarningAlertProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const WarningAlert = (props: WarningAlertProps) => {
  const {
    children,
    onClick = noop,
    className = ''
  } = props;

  return (
    <div
      className={clsx(`alert-container alert-container__warning`, className)}
      role="alert"
      onClick={onClick}
    >
      <WarningIcon />
      <p className={'alert-container-content'}>
        {children}
      </p>
    </div>
  );
};
