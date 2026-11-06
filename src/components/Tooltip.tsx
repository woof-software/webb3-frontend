import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  Placement,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { cloneElement, ReactElement, ReactNode, SyntheticEvent, useRef, useState } from 'react';

import { BREAKPOINT_SM_PX } from '@helpers/constants';
import { useMediaQuery } from '@hooks/useMediaQuery';

import DetailSheet from './DetailSheet';

const VIEWPORT_MARGIN = 8;
const ARROW_SIZE = 10;

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation();
// Portal events still bubble through the React tree to the trigger's ancestors
// (row clicks, the masthead press animation and currency toggle)
const containEvents = { onClick: stopPropagation, onMouseDown: stopPropagation, onMouseUp: stopPropagation };

type TooltipProps = {
  children: ReactElement;
  content: ReactNode;
  width?: number;
  gap?: number;
  placement?: Placement;
  hideArrow?: boolean;
  centered?: boolean;
  interactive?: boolean;
  // The trigger has its own DetailSheet on mobile, so the tooltip is desktop only
  desktopOnly?: boolean;
};

const Tooltip = ({
  children,
  content,
  width,
  gap = 10,
  placement = 'top',
  hideArrow = true,
  centered = false,
  interactive = false,
  desktopOnly = false,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINT_SM_PX}px)`);
  const arrowRef = useRef<HTMLSpanElement>(null);

  const {
    refs,
    floatingStyles,
    context,
    middlewareData,
    placement: side,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    middleware: [
      offset(hideArrow ? gap : gap + ARROW_SIZE),
      flip({ padding: VIEWPORT_MARGIN }),
      shift({ padding: VIEWPORT_MARGIN }),
      arrow({ element: arrowRef, padding: VIEWPORT_MARGIN }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { enabled: !isMobile, mouseOnly: true, handleClose: interactive ? safePolygon() : null }),
    useClick(context, { ignoreMouse: !isMobile }),
    useDismiss(context, { enabled: !isMobile, ancestorScroll: true }),
    useRole(context, { role: 'tooltip' }),
  ]);

  if (isMobile && desktopOnly) return children;

  const textAlign = centered ? 'center' : undefined;

  return (
    <>
      {cloneElement(children, getReferenceProps({ ...children.props, ref: refs.setReference }))}
      {isMobile ? (
        <DetailSheet active={isOpen} onClickOutside={() => setIsOpen(false)}>
          <div style={{ textAlign }} {...containEvents}>
            {content}
          </div>
        </DetailSheet>
      ) : (
        isOpen && (
          <FloatingPortal id="overlay">
            <div
              ref={refs.setFloating}
              className="tooltip"
              style={{ ...floatingStyles, width, maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`, textAlign }}
              {...getFloatingProps(containEvents)}
            >
              {content}
              {!hideArrow && (
                <span
                  ref={arrowRef}
                  className={`tooltip__arrow${side.startsWith('bottom') ? ' tooltip__arrow--bottom' : ''}`}
                  style={{ left: middlewareData.arrow?.x }}
                />
              )}
            </div>
          </FloatingPortal>
        )
      )}
    </>
  );
};

export default Tooltip;
