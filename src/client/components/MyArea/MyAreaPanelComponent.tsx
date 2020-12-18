import { Icon, themeColor, themeSpacing } from '@amsterdam/asc-ui';
import { spacing } from '@amsterdam/asc-ui/lib/theme/default';
import React, {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
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

export const DESKTOP_PANEL_TIP_WIDTH = px(8 * spacing);
export const DESKTOP_PANEL_PREVIEW_WIDTH = px(60 * spacing);
export const DESKTOP_PANEL_WIDTH = px(120 * spacing);
export const PHONE_PANEL_PREVIEW_HEIGHT = px(60 * spacing);
export const PHONE_PANEL_TIP_HEIGHT = px(10 * spacing);

const PHONE_FIXED_AVAILABLE_HEIGHT = 1000; // A large height for a narrow screen device

const panelStateAtom = atom<Record<string, PanelState>>({
  key: 'myAreaPanelState',
  default: {},
});

export function usePanelState() {
  return useRecoilState(panelStateAtom);
}

function getPanelSize(
  state: PanelState,
  isNarrowScreen: boolean,
  availableHeight?: number
) {
  let size = '0px';
  switch (state) {
    case PanelState.Tip:
      size = isNarrowScreen ? PHONE_PANEL_TIP_HEIGHT : DESKTOP_PANEL_TIP_WIDTH;
      break;
    case PanelState.Preview:
      size = isNarrowScreen
        ? PHONE_PANEL_PREVIEW_HEIGHT
        : DESKTOP_PANEL_PREVIEW_WIDTH;
      break;
    case PanelState.Open:
      size = isNarrowScreen
        ? px(availableHeight || PHONE_FIXED_AVAILABLE_HEIGHT)
        : DESKTOP_PANEL_WIDTH;
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
  background-color: #fff;
  max-height: 100%;
  height: auto;
  z-index: 999;
`;

const PanelDesktop = styled(Panel)`
  width: ${DESKTOP_PANEL_WIDTH};
  top: 0;
  transform: translate3d(calc(-100% + 0px), 0, 0); // first render: hidden
`;

const PanelPhone = styled(Panel)`
  right: 0;
  transform: translate3d(0, calc(100% - 0px), 0); // first render: hidden
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
  max-height: calc(100% - 40px);
`;

const PanelInnerDesktop = styled(PanelInner)`
  padding-right: ${DESKTOP_PANEL_TIP_WIDTH};
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
  height: ${PHONE_PANEL_TIP_HEIGHT};
  z-index: 2;

  &:after {
    content: '';
    display: block;
    height: ${themeSpacing(2)};
    width: 16rem;
    border-radius: ${themeSpacing(1.5)};
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
  width: ${DESKTOP_PANEL_TIP_WIDTH};

  ${Icon} {
    height: ${themeSpacing(11)};
    width: ${themeSpacing(6)};
    background-color: #fff;
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
  z-index: 20000;
  width: ${themeSpacing(6)};
  height: ${themeSpacing(6)};
`;

type PanelDesktopAnimatedProps = PropsWithChildren<{
  width: string;
}>;

function PanelDesktopAnimated({ children, width }: PanelDesktopAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform: `translate3d(calc(-100% + ${width}), 0, 0)`,
    config: { mass: 0.3, tension: 400 },
  });
  return <PanelDesktop style={anim}>{children}</PanelDesktop>;
}

type PanelPhoneAnimatedProps = PropsWithChildren<{
  height: string;
  onSwipedUp: any;
  onSwipedDown: any;
  id: string;
}>;

const swipeConfig = {
  delta: 40, // min distance(px) before a swipe starts
  preventDefaultTouchmoveEvent: true, // call e.preventDefault *See Details*
  trackTouch: true, // track touch input
  trackMouse: false, // track mouse input
  rotationAngle: 0, // set a rotation angle
};

function PanelPhoneAnimated({
  children,
  height,
  onSwipedUp,
  onSwipedDown,
  id,
}: PanelPhoneAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform: `translate3d(0, calc(100% - ${height}), 0)`,
    height,
    config: {
      mass: 0.3,
      tension: 400,
    },
  });
  const handlers = useSwipeable({
    onSwipedUp,
    onSwipedDown,
    ...swipeConfig,
  });
  return (
    <PanelPhone {...handlers} id={id} style={anim}>
      {children}
    </PanelPhone>
  );
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

  return {
    states,
    next: nextState,
    prev: prevState,
    cycle: cycleNext,
    set: setState,
    initial: setInitialState,
    state,
  };
}

export type PanelComponentProps = PropsWithChildren<{
  id: string;
  onTogglePanel?: (id: string, state: PanelState) => void;
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  cycle: any;
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
  const { state, initialState, next, prev, cycle: cycleState, states } = cycle;

  useEffect(() => {
    if (state === states[0]) {
      ref?.current?.scrollTo(0, 0);
    }
  }, [state, initialState, states]);

  const showToggleButton =
    !showCloseButton || (isNarrowScreen && state !== PanelState.Open);

  return isNarrowScreen ? (
    <PanelPhoneAnimated
      id={id}
      onSwipedUp={(event: any) => {
        if (ref.current && !ref.current.contains(event.event.target)) {
          next();
        }
      }}
      onSwipedDown={(event: any) => {
        if (ref.current && !ref.current.contains(event.event.target)) {
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
          aria-expanded={
            state !== PanelState.Closed && state !== PanelState.Tip
          }
          onClick={cycleState}
        />
      )}
      <PanelInnerPhone className="panel-inner" panelState={state} ref={ref}>
        {children}
      </PanelInnerPhone>
    </PanelPhoneAnimated>
  ) : (
    <PanelDesktopAnimated width={getPanelSize(state, false)}>
      {showCloseButton && <StyledCloseButton onClick={cycleState} />}
      {showToggleButton && (
        <PanelToggleDesktop
          aria-expanded={
            state !== PanelState.Closed && state !== PanelState.Tip // Consider the Panel at Tip state as not expanded
          }
          onClick={cycleState}
        >
          <Icon size={16}>
            <IconChevronRight />
          </Icon>
        </PanelToggleDesktop>
      )}
      <PanelInnerDesktop panelState={state} ref={ref}>
        {children}
      </PanelInnerDesktop>
    </PanelDesktopAnimated>
  );
}
