import {
  ButtonHTMLAttributes,
  forwardRef,
  HTMLProps,
  MouseEvent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

import { Button } from '@amsterdam/design-system-react';
import {
  ChevronRightIcon,
  CloseIcon,
} from '@amsterdam/design-system-react-icons';
import { animated, AnimatedValue, useSpring } from '@react-spring/web';
import classnames from 'classnames';
import { useSwipeable } from 'react-swipeable';

import styles from './PanelComponent.module.scss';
import {
  getPanelSize,
  PanelState,
  type usePanelStateCycle,
} from './panelCycle';
import { useWidescreen } from '../../../hooks/media.hook';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const NARROW_PANEL_SWIPE_CONFIG = {
  delta: 40, // min distance(px) before a swipe starts
  preventDefaultTouchmoveEvent: true,
  trackTouch: true,
  trackMouse: false,
  rotationAngle: 0,
};

// Spring animation props
const WIDE_PANEL_SPRING_CONFIG = { mass: 0.3, tension: 400 };
const NARROW_PANEL_SPRING_CONFIG = { mass: 0.3, tension: 400 };

type PanelWideAnimatedProps = PropsWithChildren<{
  width: string;
}>;

const Panel = forwardRef<HTMLDivElement, AnimatedValue<any>>(
  ({ children, className, ...rest }, ref) => {
    return (
      <animated.div
        className={classnames(styles.Panel, className)}
        ref={ref}
        {...rest}
      >
        {children}
      </animated.div>
    );
  }
);

const PanelInner = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ children, className }, ref) => (
    <div className={classnames(styles.PanelInner, className)} ref={ref}>
      {children}
    </div>
  )
);

const PanelInnerDesktop = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ children }, ref) => (
    <PanelInner ref={ref} className={styles.PanelInnerDesktop}>
      {children}
    </PanelInner>
  )
);

const PanelInnerPhone = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ children }, ref) => (
    <PanelInner ref={ref} className={styles.PanelInnerPhone}>
      {children}
    </PanelInner>
  )
);

function PanelWide({
  children,
  style,
}: { children: ReactNode } & AnimatedValue<any>) {
  return (
    <Panel className={styles.PanelWide} style={style}>
      {children}
    </Panel>
  );
}

const PanelNarrow = forwardRef<HTMLDivElement, AnimatedValue<any>>(
  ({ children, ...rest }, ref) => {
    return (
      <Panel {...rest} className={styles.PanelNarrow} ref={ref}>
        {children}
      </Panel>
    );
  }
);

function ToggleButtonPhone({ ...rest }: ButtonProps) {
  return <button {...rest} className={styles.PanelTogglePhone} />;
}

function PanelWideAnimated({ children, width }: PanelWideAnimatedProps) {
  const anim = useSpring({
    transform: `translate3d(calc(-100% + ${width}), 0, 0)`,
    config: WIDE_PANEL_SPRING_CONFIG,
  });
  return <PanelWide style={anim}>{children}</PanelWide>;
}

type PanelNarrowAnimatedProps = PropsWithChildren<{
  height: string;
  onSwipedUp: any;
  onSwipedDown: any;
  id: string;
}>;

function PanelNarrowAnimated({
  children,
  height,
  onSwipedUp,
  onSwipedDown,
  id,
}: PanelNarrowAnimatedProps) {
  const anim = useSpring({
    transform: `translate3d(0, calc(100% - ${height}), 0)`,
    height,
    config: NARROW_PANEL_SPRING_CONFIG,
  });

  const handlers = useSwipeable({
    onSwipedUp,
    onSwipedDown,
    ...NARROW_PANEL_SWIPE_CONFIG,
  });
  return (
    <PanelNarrow {...handlers} id={id} style={anim}>
      {children}
    </PanelNarrow>
  );
}

export type PanelComponentProps = PropsWithChildren<{
  id: string;
  onTogglePanel?: (id: string, state: PanelState) => void;
  onClose?: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  cycle: ReturnType<typeof usePanelStateCycle>;
  availableHeight: number;
  showCloseButton?: boolean;
}>;

export function PanelComponent({
  id,
  children,
  cycle,
  availableHeight,
  showCloseButton,
  onClose,
}: PanelComponentProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const ref = useRef<HTMLDivElement | null>(null);
  const { state, next, prev, cycle: cycleState, states } = cycle;

  // If we have scrolled a PanelInner, move the scroll position to top if we
  // are cycling to the first state.
  useEffect(() => {
    if (state === states[0] && ref.current?.scrollTo) {
      ref.current.scrollTo(0, 0);
    }
  }, [state, states]);

  const showToggleButton = !showCloseButton;

  const isPanelExpanded =
    state !== PanelState.Closed && state !== PanelState.Tip; // Consider the Panel at Tip state as not expanded

  const onSwipedUp = (event: any) => {
    // If panel inner is not scrollable or if the panel is scrollable and scrolled to the maximum
    if (
      (ref?.current && ref.current.scrollHeight <= ref.current.clientHeight) ||
      (ref?.current &&
        ref.current.scrollHeight > ref.current.clientHeight &&
        ref.current.scrollHeight - ref.current.clientHeight >=
          ref.current?.scrollTop)
    ) {
      next();
    }
  };

  const onSwipedDown = (event: any) => {
    // If panel inner is not scrollable or if the panel is scrollable and scrolled to the top
    if (
      (ref?.current && ref.current.scrollHeight <= ref.current.clientHeight) ||
      (ref?.current &&
        ref.current.scrollHeight > ref.current.clientHeight &&
        ref.current?.scrollTop === 0)
    ) {
      prev();
    }
  };

  return isNarrowScreen ? (
    <PanelNarrowAnimated
      id={id}
      onSwipedUp={onSwipedUp}
      onSwipedDown={onSwipedDown}
      height={getPanelSize(state, true, availableHeight)}
    >
      {showCloseButton && (
        <Button
          className={styles.CloseButton}
          onClick={(event) => {
            cycleState();
            onClose?.(event);
          }}
          icon={CloseIcon}
          iconOnly
          aria-label={`${id} paneel sluiten`}
        />
      )}
      {showToggleButton && (
        <ToggleButtonPhone
          aria-expanded={isPanelExpanded}
          aria-label={
            !isPanelExpanded ? `Maak ${id} paneel groter` : `Sluit ${id} paneel`
          }
          onClick={cycleState}
        />
      )}
      <PanelInnerPhone ref={ref}>{children}</PanelInnerPhone>
    </PanelNarrowAnimated>
  ) : (
    <PanelWideAnimated width={getPanelSize(state, false)}>
      {showCloseButton && (
        <Button
          className={styles.CloseButton}
          variant="tertiary"
          onClick={(event) => {
            cycleState();
            onClose?.(event);
          }}
          icon={CloseIcon}
          iconOnly
          aria-label={`${id} paneel sluiten`}
        />
      )}
      {showToggleButton && (
        <Button
          className={styles.PanelToggleDesktop}
          aria-expanded={isPanelExpanded}
          aria-label={`${isPanelExpanded ? 'Sluit' : 'Open'} ${id} paneel`}
          onClick={cycleState}
          icon={isPanelExpanded ? CloseIcon : ChevronRightIcon}
          variant={isPanelExpanded ? 'tertiary' : 'secondary'}
        >
          {isPanelExpanded ? '' : 'Legenda'}
        </Button>
      )}
      <PanelInnerDesktop ref={ref}>{children}</PanelInnerDesktop>
    </PanelWideAnimated>
  );
}
