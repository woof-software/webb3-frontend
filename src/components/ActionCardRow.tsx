import { ReactNode } from 'react';

export interface ActionCardRowProps {
  title: ReactNode;
  info: ReactNode;
}

export const ActionCardRow = (props: ActionCardRowProps) => {
  const { title, info } = props;

  return (
    <div className="action-card-row">
      <span className="action-card-row-title">
        {title}
      </span>
      <span className="action-card-row-info">
        {info}
      </span>
    </div>
  );
};
