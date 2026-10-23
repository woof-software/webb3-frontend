import { useState } from 'react';

import { CircleExclamation } from '@components/Icons';
import Tooltip from '@components/Tooltip';

export type TokenVisibilityToggleProps = {
  checked?: boolean;
  onChange?: () => void;
};

const TokenVisibilityToggle = (props: TokenVisibilityToggleProps) => {
  const { checked, onChange } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <span className={`visibility-toggle${checked ? ' visibility-toggle--checked' : ''}`}>
      <label className='visibility-toggle__label L2 label text-color--2'>
        <span className='visibility-toggle__hint' onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          Show top collateral only
          <Tooltip
            open={hovered}
            width={240}
            yOffset={12}
            content={
              <span className='visibility-toggle__tooltip-text'>
                Show top collateral while hiding assets below $250k or flagged as low-priority.
              </span>
            }
          >
            <span className='visibility-toggle__icon'>
              <CircleExclamation className='svg--icon--3' />
            </span>
          </Tooltip>
        </span>
        <span className='visibility-toggle__bar'>
          <input className='visibility-toggle__input' type='checkbox' checked={checked} onChange={onChange} />
          <span className='visibility-toggle__thumb'></span>
        </span>
      </label>
    </span>
  );
};

export default TokenVisibilityToggle;
