import { Icon, themeColor, themeSpacing } from '@amsterdam/asc-ui';
import { spacing } from '@amsterdam/asc-ui/lib/theme/default';
import React, {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { animated, useSpring, UseSpringBaseProps } from 'react-spring';
import { useSwipeable } from 'react-swipeable';
import { atom, useRecoilState } from 'recoil';
import styled from 'styled-components';
import { IconChevronRight } from '../../assets/icons';
import { useWidescreen } from '../../hooks/media.hook';
import { CloseButton } from '../Button/Button';

export enum PanelState {
  Closed = 'CLOSED', // Panel is invisible
  Tip = 'TIP', // Only panel toggle button visible on screen
  Preview = 'PREVIEW', // Part of the panel is available
  Open = 'OPEN', // Panel is fully open at $availableHeight
}

function px(size: number) {
  return size + 'px';
}

export const WIDE_PANEL_TIP_WIDTH = px(8 * spacing);
export const WIDE_PANEL_PREVIEW_WIDTH = px(60 * spacing);
export const WIDE_PANEL_WIDTH = px(120 * spacing);
export const NARROW_PANEL_PREVIEW_HEIGHT = px(60 * spacing);
export const NARROW_PANEL_TIP_HEIGHT = px(10 * spacing);

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

  const setInitialState = useCallback(() => setState(initialState), [
    initialState,
    setState,
  ]);

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
  switch (state) {
    case PanelState.Tip:
      size = isNarrowScreen ? NARROW_PANEL_TIP_HEIGHT : WIDE_PANEL_TIP_WIDTH;
      break;
    case PanelState.Preview:
      size = isNarrowScreen
        ? NARROW_PANEL_PREVIEW_HEIGHT
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

const Panel = styled(animated.div)`
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: ${themeColor('tint', 'level1')};
  max-height: 100%;
  height: auto;
  z-index: 401; // See also: _z-index.scss > my-area-map-panel
`;

const PanelWide = styled(Panel)`
  width: ${WIDE_PANEL_WIDTH};
  top: 0;
  transform: translate3d(
    calc(-100% + 0px),
    0,
    0
  ); // at first render, panel is outside viewport
`;

const PanelNarrow = styled(Panel)`
  right: 0;
  transform: translate3d(
    0,
    calc(100% - 0px),
    0
  ); // at first render, panel is outside viewport
`;

const PanelInner = styled.div<{ panelState: PanelState }>`
  position: relative;
  z-index: 1;
  max-height: 100%; // set max height to enable overflow scrolling.
  overflow-y: auto;
`;

const PanelInnerPhone = styled(PanelInner)`
  padding-right: ${themeSpacing(4)};
  padding-left: ${themeSpacing(4)};
  max-height: calc(
    100% - ${themeSpacing(15)}
  ); // Add a little slack to the bottom
`;

const PanelInnerDesktop = styled(PanelInner)`
  padding-right: ${WIDE_PANEL_TIP_WIDTH};
  padding-left: ${themeSpacing(4)};
`;

const PanelTogglePhone = styled.button`
  border: 0;
  padding: 0;
  appearance: none;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  flex-shrink: 0;
  height: ${NARROW_PANEL_TIP_HEIGHT};
  z-index: 2;

  &:after {
    content: '';
    display: block;
    height: ${themeSpacing(2)};
    width: ${themeSpacing(30)};
    border-radius: ${themeSpacing(3)};
    background: ${themeColor('tint', 'level3')};
  }
`;

const PanelToggleDesktop = styled.button`
  position: absolute;
  right: 0;
  bottom: 0;
  top: 0;
  display: block;
  background-color: ${themeColor('tint', 'level1')};
  border: 0;
  padding: 0;
  box-shadow: none;
  z-index: 2; // Place above innerpanels so we hide the scrollbar of that panel
  width: ${WIDE_PANEL_TIP_WIDTH};

  ${Icon} {
    height: ${themeSpacing(11)};
    width: ${themeSpacing(6)};
    background-color: ${themeColor('tint', 'level1')};
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    left: 100%;
    position: absolute;
    top: ${themeSpacing(4)};

    svg {
      transform: ${(props) =>
        props['aria-expanded'] ? 'rotate(180deg)' : 'none'};
      transition: transform 200ms ease-in;
    }
  }
`;

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  right: ${themeSpacing(6)};
  top: ${themeSpacing(4)};
  z-index: 3;
  width: ${themeSpacing(6)};
  height: ${themeSpacing(6)};
`;

type PanelWideAnimatedProps = PropsWithChildren<{
  width: string;
}>;

function PanelWideAnimated({ children, width }: PanelWideAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
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
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
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
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
}: PanelComponentProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const ref = useRef<HTMLDivElement | null>(null);
  const { state, next, prev, cycle: cycleState, states } = cycle;

  // If we have scrolled a PanelInner, move the scroll position to top if we
  // are cycling to the first state.
  useEffect(() => {
    if (state === states[0]) {
      ref?.current?.scrollTo(0, 0);
    }
  }, [state, states]);

  const showToggleButton = !showCloseButton;

  const isPanelExpanded =
    state !== PanelState.Closed && state !== PanelState.Tip; // Consider the Panel at Tip state as not expanded

  return isNarrowScreen ? (
    <PanelNarrowAnimated
      id={id}
      onSwipedUp={(event: any) => {
        // If panel inner is not scrollable or if the panel is scrollable and scrolled to the maximum
        if (
          (ref?.current &&
            ref.current.scrollHeight <= ref.current.clientHeight) ||
          (ref?.current &&
            ref.current.scrollHeight > ref.current.clientHeight &&
            ref.current.scrollHeight - ref.current.clientHeight ===
              ref.current?.scrollTop)
        ) {
          next();
        }
      }}
      onSwipedDown={(event: any) => {
        // If panel inner is not scrollable or if the panel is scrollable and scrolled to the top
        if (
          (ref?.current &&
            ref.current.scrollHeight <= ref.current.clientHeight) ||
          (ref?.current &&
            ref.current.scrollHeight > ref.current.clientHeight &&
            ref.current?.scrollTop === 0)
        ) {
          prev();
        }
      }}
      height={getPanelSize(state, true, availableHeight)}
    >
      {showCloseButton && (
        <StyledCloseButton iconSize="24" onClick={cycleState} />
      )}
      {showToggleButton && (
        <PanelTogglePhone
          aria-expanded={isPanelExpanded}
          onClick={cycleState}
        />
      )}
      <PanelInnerPhone className="panel-inner" panelState={state} ref={ref}>
        {children}
      </PanelInnerPhone>
    </PanelNarrowAnimated>
  ) : (
    <PanelWideAnimated width={getPanelSize(state, false)}>
      {showCloseButton && <StyledCloseButton onClick={cycleState} />}
      {showToggleButton && (
        <PanelToggleDesktop
          aria-expanded={isPanelExpanded}
          onClick={cycleState}
        >
          <Icon size={16}>
            <IconChevronRight />
          </Icon>
        </PanelToggleDesktop>
      )}
      <PanelInnerDesktop className="panel-inner" panelState={state} ref={ref}>
        {children}
      </PanelInnerDesktop>
    </PanelWideAnimated>
  );
}
