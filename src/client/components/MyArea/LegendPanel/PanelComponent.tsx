import {
  ButtonHTMLAttributes,
  forwardRef,
  HTMLProps,
  MouseEvent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
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
import { atom, useRecoilState } from 'recoil';

import styles from './PanelComponent.module.scss';
import { useWidescreen } from '../../../hooks/media.hook';

export enum PanelState {
  Closed = 'CLOSED', // Panel is invisible
  Tip = 'TIP', // Only panel toggle button visible on screen
  Preview = 'PREVIEW', // Part of the panel is available
  Open = 'OPEN', // Panel is fully open at $availableHeight
}

function px(size: number) {
  return size + 'px';
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const UNIT_SIZE = 4;
const TIP_WIDTH = 0;
const PREVIEW_WIDTH = 60;
const FULL_WIDTH = 160;
const NARROW_TIP_HEIGHT = 15;

export const WIDE_PANEL_TIP_WIDTH = px(TIP_WIDTH * UNIT_SIZE);
export const WIDE_PANEL_PREVIEW_WIDTH = px(PREVIEW_WIDTH * UNIT_SIZE);
export const WIDE_PANEL_WIDTH = px(FULL_WIDTH * UNIT_SIZE);
export const NARROW_PANEL_PREVIEW_HEIGHT = px(60 * UNIT_SIZE);
export const NARROW_PANEL_TIP_HEIGHT = px(NARROW_TIP_HEIGHT * UNIT_SIZE);

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

// A large height for a narrow screen device so we'l have enough max height
const PHONE_FIXED_AVAILABLE_HEIGHT = 1000;

const panelStateAtom = atom<Record<string, PanelState>>({
  key: 'myAreaPanelState',
  default: {},
});

export function usePanelState() {
  return useRecoilState(panelStateAtom);
}

export function usePanelStateCycle(
  id: string,
  states: PanelState[],
  initialPanelState?: PanelState
) {
  const [stateStore, setStateStore] = usePanelState();
  const initialState = initialPanelState || states[0];
  const state = stateStore[id] || initialState;

  const setState = useCallback(
    (state: PanelState) => {
      setStateStore((store) => ({ ...store, [id]: state }));
    },
    [setStateStore, id]
  );

  const nextPanelState = useCallback(
    (currentState: PanelState): PanelState => {
      const currentStateIndex = states.indexOf(currentState);
      const nextState =
        states.length - 1 === currentStateIndex
          ? states[0]
          : states[currentStateIndex + 1];
      return nextState;
    },
    [states]
  );

  const nextState = useCallback(
    (event?: any) => {
      if (state !== states[states.length - 1]) {
        const nextState = nextPanelState(state);
        setState(nextState);
      }
    },
    [states, state, setState, nextPanelState]
  );

  const prevState = useCallback(
    (event?: any) => {
      const index = states.indexOf(state);
      if (index !== 0) {
        setState(states[index - 1]);
      }
    },
    [states, state, setState]
  );

  const cycleNext = useCallback(
    (event?: any) => {
      const nextState = nextPanelState(state);
      setState(nextState);
    },
    [state, setState, nextPanelState]
  );

  const setInitialState = useCallback(
    () => setState(initialState),
    [initialState, setState]
  );

  return useMemo(
    () => ({
      states,
      next: nextState,
      prev: prevState,
      cycle: cycleNext,
      set: setState,
      initial: setInitialState,
      initialState,
      state,
      reset: () => setState(initialState),
    }),
    [
      states,
      nextState,
      prevState,
      cycleNext,
      setState,
      setInitialState,
      state,
      initialState,
    ]
  );
}

function getPanelSize(
  state: PanelState,
  isNarrowScreen: boolean,
  availableHeight?: number
) {
  let size = '0px';
  let narrowPanelPreviewHeight = NARROW_PANEL_PREVIEW_HEIGHT;

  if (
    availableHeight &&
    availableHeight < parseInt(NARROW_PANEL_PREVIEW_HEIGHT, 10)
  ) {
    narrowPanelPreviewHeight = px(availableHeight);
  }
  switch (state) {
    case PanelState.Tip:
      size = isNarrowScreen ? NARROW_PANEL_TIP_HEIGHT : WIDE_PANEL_TIP_WIDTH;
      break;
    case PanelState.Preview:
      size = isNarrowScreen
        ? narrowPanelPreviewHeight
        : WIDE_PANEL_PREVIEW_WIDTH;
      break;
    case PanelState.Open:
      size = isNarrowScreen
        ? px(availableHeight || PHONE_FIXED_AVAILABLE_HEIGHT)
        : WIDE_PANEL_WIDTH;
      break;
    case PanelState.Closed:
      size = '0px';
      break;
  }
  return size;
}

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
