import { ChevronRight } from '@amsterdam/asc-assets';
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
import { atom, useRecoilState } from 'recoil';
import styled from 'styled-components';
import { usePhoneScreen } from '../../hooks/media.hook';
import { CloseButton } from '../Button/Button';
import { useComponentSize } from '../../hooks/useComponentSize';

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

export const PHONE_PANEL_PREVIEW_HEIGHT = px(32 * spacing);
export const PHONE_PANEL_TIP_HEIGHT = px(10 * spacing);

const PHONE_FIXED_AVAILABLE_HEIGHT = 1000;

const panelStateAtom = atom<Record<string, PanelState>>({
  key: 'myAreaPanelState',
  default: {},
});

export function usePanelState() {
  return useRecoilState(panelStateAtom);
}

function panelSize(
  state: PanelState,
  isPhone: boolean,
  availableHeight?: number
) {
  let size = '0px';
  switch (state) {
    case PanelState.Tip:
      size = isPhone ? PHONE_PANEL_TIP_HEIGHT : DESKTOP_PANEL_TIP_WIDTH;
      break;
    case PanelState.Preview:
      size = isPhone ? PHONE_PANEL_PREVIEW_HEIGHT : DESKTOP_PANEL_PREVIEW_WIDTH;
      break;
    case PanelState.Open:
      size = isPhone
        ? px(availableHeight || PHONE_FIXED_AVAILABLE_HEIGHT)
        : DESKTOP_PANEL_WIDTH;
      break;
    case PanelState.Closed:
      size = '0px';
      break;
  }
  console.log('panelSize', state, isPhone, size);
  return size;
}

const Panel = styled(animated.div)`
  position: absolute;
  display: flex;
  left: 0;
  bottom: 0;
  background-color: #fff;
  max-height: 100%;
  height: auto;
  z-index: 999;
`;

const PanelDesktop = styled(Panel)`
  flex-direction: row;
  width: ${DESKTOP_PANEL_WIDTH};
  top: 0;
  transform: translate3d(calc(-100% + 0px), 0, 0); // first render: hidden
`;

const PanelPhone = styled(Panel)`
  flex-direction: column;
  right: 0;
  transform: translate3d(0, calc(100% - 0px), 0); // first render: hidden
`;

const PanelInner = styled.div<{ panelState: PanelState }>`
  position: relative;
  flex-grow: 1;
  z-index: 1;
  max-height: 100%; // set max height to enable overflow scrolling.
  overflow-y: ${(props) =>
    props.panelState === PanelState.Open ? 'auto' : 'hidden'};
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${themeColor(
    'tint',
    'level1'
  )}; // Hides underlying scrollbar
  border: 0;
  padding: 0;
  box-shadow: none;
  z-index: 2;
  width: ${DESKTOP_PANEL_TIP_WIDTH};
  > span {
    transform: ${(props) =>
      props['aria-expanded'] ? 'rotate(180deg)' : 'none'};
    transition: transform 200ms ease-in;
  }
  &:hover {
    background-color: ${themeColor('tint', 'level2')};
  }
`;

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  right: ${themeSpacing(6)};
  top: ${themeSpacing(6)};
  z-index: 20000;
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
}>;

function PanelPhoneAnimated({ children, height }: PanelPhoneAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform: `translate3d(0, calc(100% - ${height}), 0)`,
    height,
    config: {
      mass: 0.3,
      tension: 400,
    },
  });
  console.log('phone', height, `translate3d(0, calc(100% - ${height}), 0)`);
  return <PanelPhone style={anim}>{children}</PanelPhone>;
}

export type PanelComponentProps = PropsWithChildren<{
  id: string;
  onTogglePanel?: (id: string, state: PanelState) => void;
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  cycle: PanelState[];
  availableHeight: number;
}>;

export function PanelComponent({
  id,
  children,
  onTogglePanel,
  onClose,
  cycle = [PanelState.Preview, PanelState.Open],
  availableHeight,
}: PanelComponentProps) {
  const [stateStore, setStateStore] = usePanelState();
  const initialState = cycle[0];
  const state = stateStore[id] || initialState;
  const setState = useCallback(
    (state: PanelState) => {
      setStateStore((store) => ({ ...store, [id]: state }));
    },
    [setStateStore, id]
  );
  const isPhone = usePhoneScreen();
  const ref = useRef<HTMLDivElement | null>(null);
  // const { height: contentHeight } = useComponentSize(ref.current);

  useEffect(() => {
    onTogglePanel && onTogglePanel(id, state);
    // Disabled deps here because we only want to respond to actual state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  function nextPanelState(currentState: PanelState): PanelState {
    const currentStateIndex = cycle.indexOf(currentState);
    return cycle.length - 1 === currentStateIndex
      ? cycle[0]
      : cycle[currentStateIndex + 1];
  }

  useEffect(() => {
    if (state === initialState) {
      ref?.current?.scrollTo(0, 0);
    }
  }, [state, initialState]);

  const hasCloseCallback = !!onClose;
  const showToggleButton =
    !hasCloseCallback || (hasCloseCallback && state !== PanelState.Open);
  const showCloseButton = !isPhone && hasCloseCallback && !showToggleButton;

  return isPhone ? (
    <PanelPhoneAnimated height={panelSize(state, true, availableHeight)}>
      <PanelTogglePhone
        aria-expanded={state !== PanelState.Closed && state !== PanelState.Tip}
        onClick={() => {
          setState(nextPanelState(state));
        }}
      />
      <PanelInner panelState={state} ref={ref}>
        {children}
      </PanelInner>
    </PanelPhoneAnimated>
  ) : (
    <PanelDesktopAnimated width={panelSize(state, false)}>
      {showCloseButton && (
        <StyledCloseButton
          onClick={(event) => {
            setState(PanelState.Closed);
            onClose && onClose(event);
          }}
        />
      )}
      <PanelInner panelState={state} ref={ref}>
        {children}
      </PanelInner>
      {showToggleButton && (
        <PanelToggleDesktop
          aria-expanded={
            state !== PanelState.Closed && state !== PanelState.Tip // Consider the Panel at Tip state as not expanded
          }
          onClick={() => setState(nextPanelState(state))}
        />
      )}
    </PanelDesktopAnimated>
  );
}
