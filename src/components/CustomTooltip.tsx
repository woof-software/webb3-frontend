import { clsx } from 'clsx';
import { useState, ReactNode, useEffect, useRef, PropsWithChildren } from 'react';

import { useMediaQuery } from '@hooks/useMediaQuery';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface CustomTooltipProps extends PropsWithChildren {
  content: ReactNode;
  className?: string;
}

export const CustomTooltip = (props: CustomTooltipProps) => {
  const { content, children, className = '' } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>('top');

  const isLargeScreen = useMediaQuery('(min-width: 1121px)');

  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    setPosition('top');
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const toggleMobile = () => {
    setIsVisible(prev => !prev);
  };

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();

    // Vertical check
    if (position === 'top' && rect.top < 0) {
      setPosition('bottom');
    }

    if (position === 'bottom' && rect.bottom >= window.innerHeight) {
      setPosition('top');
    }

    // Horizontal check
    if (rect.left < 0) {
      setPosition('right');
    }

    if (rect.right >= window.innerWidth) {
      setPosition('left');
    }

  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || isLargeScreen) return;

    const handleTouchOutside = (e: TouchEvent) => {
      const { current: target } = triggerRef;

      if (!target) return;

      const { target: source } = e;

      if (!(source instanceof Node)) return;

      if (source === target || target.contains(source)) return;

      hideTooltip();
    };

    document.addEventListener('touchstart', handleTouchOutside);
    return () => document.removeEventListener('touchstart', handleTouchOutside);
  }, [isVisible, isLargeScreen]);

  let handlers;

  if (isLargeScreen) {
    handlers = {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip
    };
  } else {
    handlers = {
      onTouchStart: toggleMobile
    };
  }

  return (
    <div className="custom-tooltip-wrapper">
      <div
        ref={triggerRef}
        className="custom-tooltip-trigger"
        {...handlers}
      >
        {children}
      </div>

      <div
        ref={tooltipRef}
        className={clsx(
          `custom-tooltip custom-tooltip--${position}`,
          { 'custom-tooltip--visible': isVisible },
          className
        )}
      >
        {content}
      </div>
    </div>
  );
};
