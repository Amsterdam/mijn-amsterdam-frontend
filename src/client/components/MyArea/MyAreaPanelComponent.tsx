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

export enum PanelState {
  Open = 'OPEN', // Panel is fully open at $availableHeight
  Closed = 'CLOSED', // Panel is invisible
  Preview = 'PREVIEW', // Part of the panel is available
  Tip = 'TIP', // Only panel toggle button visible on screen
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

export const DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH = 8 * spacing;
export const DESKTOP_PANEL_WIDTH = 120 * spacing;
export const DESKTOP_PANEL_PREVIEW_WIDTH = 60 * spacing;

const PanelDesktop = styled(Panel)`
  width: ${DESKTOP_PANEL_WIDTH}px;
  top: 0;
  transform: translateX(calc(-100% + ${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px));
  overflow-y: auto;
`;

export const PHONE_PANEL_PREVIEW_HEIGHT = 32 * spacing;
export const PHONE_PANEL_TIP_HEIGHT = 10 * spacing;

export const PhonePanelPadding = {
  TOP: PHONE_PANEL_TIP_HEIGHT,
  RIGHT: spacing * 4,
  BOTTOM: spacing * 6,
  LEFT: spacing * 4,
};

const phonePanelPaddingString = Object.values(PhonePanelPadding)
  .map((spacing) => spacing + 'px')
  .join(' ');

const PanelPhone = styled(Panel)`
  right: 0;
  /* padding: ${phonePanelPaddingString}; */
  transform: translateY(calc(100% - ${PhonePanelPadding.TOP}px));
`;

const PanelInner = styled.div<{ panelState: PanelState }>`
  position: relative;
  z-index: 1;
  max-height: 100%;
  overflow-y: ${(props) =>
    props.panelState === PanelState.Open ? 'auto' : 'hidden'};
`;

const PhonePanelInner = styled(PanelInner)`
  padding: ${phonePanelPaddingString};
`;

const DesktopPanelInner = styled(PanelInner)`
  padding: ${themeSpacing(8)};
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
  position: absolute;
  height: ${PhonePanelPadding.TOP}px;
  z-index: 2;

  &:after {
    content: '';
    display: block;
    height: ${themeSpacing(2)};
    width: 16rem;
    border-radius: ${themeSpacing(1.5)};
    background: #ccc;
  }
`;

const StyledToggleButton = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  padding: 0;
  box-shadow: none;
  z-index: 2;
  width: ${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px;
  > span {
    transform: ${(props) =>
      props['aria-expanded'] ? 'rotate(180deg)' : 'none'};
    transition: transform 200ms ease-in;
  }
  &:hover {
    background-color: ${themeColor('tint', 'level2')};
  }
`;

interface PanelToggleDesktopProps {
  onClick: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>
  ) => void;
  isExpanded: boolean;
}

function PanelToggleDesktop({ onClick, isExpanded }: PanelToggleDesktopProps) {
  return (
    <StyledToggleButton aria-expanded={isExpanded} onClick={onClick}>
      <Icon size={20}>
        <ChevronRight />
      </Icon>
    </StyledToggleButton>
  );
}

const StyledPanelContent = styled.div<{ zIndex: number; isActive: boolean }>`
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: ${(props) => props.zIndex};
  display: ${(props) => (props.isActive ? 'block' : 'none')};
`;

type PanelContentProps = PropsWithChildren<{
  zIndex?: number;
  isActive?: boolean;
}>;

export function PanelContent({
  zIndex = 1,
  isActive = true,
  children,
}: PanelContentProps) {
  return (
    <StyledPanelContent zIndex={zIndex} isActive={isActive}>
      {children}
    </StyledPanelContent>
  );
}

type PanelDesktopAnimatedProps = PropsWithChildren<{
  state: PanelState;
}>;

function PanelDesktopAnimated({ state, children }: PanelDesktopAnimatedProps) {
  let transform = `translate3d(calc(-100% + 0px), 0, 0)`;

  switch (state) {
    case PanelState.Tip:
      transform = `translate3d(calc(-100% + ${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px), 0, 0)`;
      break;
    case PanelState.Preview:
      transform = `translate3d(calc(-100% + ${DESKTOP_PANEL_PREVIEW_WIDTH}px), 0, 0)`;
      break;
    case PanelState.Open:
      transform = 'translate3d(calc(0% + 0px), 0, 0)';
      break;
  }

  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform,
    config: { mass: 0.3, tension: 400 },
  });
  return <PanelDesktop style={anim}>{children}</PanelDesktop>;
}

type PanelPhoneAnimatedProps = PropsWithChildren<{
  state: PanelState;
  height: number;
}>;

function PanelPhoneAnimated({
  state,
  children,
  height,
}: PanelPhoneAnimatedProps) {
  let transform = `translate3d(0, calc(100% - 0px), 0)`;

  switch (state) {
    case PanelState.Tip:
      transform = `translate3d(0, calc(100% - ${PHONE_PANEL_TIP_HEIGHT}px), 0)`;
      break;
    case PanelState.Preview:
      transform = `translate3d(0, calc(100% - ${PHONE_PANEL_PREVIEW_HEIGHT}px), 0)`;
      break;
    case PanelState.Open:
      transform = 'translate3d(0, calc(0% - 0px), 0)';
      break;
  }
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform,
    height,
    config: {
      mass: 0.3,
      tension: 400,
    },
  });
  return <PanelPhone style={anim}>{children}</PanelPhone>;
}

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 20000;
`;

const panelStateAtom = atom<Record<string, PanelState>>({
  key: 'myAreaPanelState',
  default: {},
});

export function usePanelState() {
  return useRecoilState(panelStateAtom);
}

export type PanelComponentProps = PropsWithChildren<{
  id: string;
  onTogglePanel?: (id: string, state: PanelState, panelheight?: number) => void;
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

  const panelHeight = useMemo(() => {
    return availableHeight + PhonePanelPadding.TOP + PhonePanelPadding.BOTTOM;
  }, [availableHeight]);

  useEffect(() => {
    onTogglePanel && onTogglePanel(id, state, panelHeight);
    // Disabled deps here because we only want to respond to actual state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  function nextPanelState(currentState: PanelState): PanelState {
    const currentStateIndex = cycle.indexOf(currentState);
    const nextState =
      cycle.length - 1 === currentStateIndex
        ? cycle[0]
        : cycle[currentStateIndex + 1];

    return nextState;
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
    <PanelPhoneAnimated state={state} height={panelHeight}>
      <PanelTogglePhone
        aria-expanded={state !== PanelState.Closed && state !== PanelState.Tip}
        onClick={() => {
          setState(nextPanelState(state));
        }}
      />
      <PhonePanelInner panelState={state} ref={ref}>
        {children}
      </PhonePanelInner>
    </PanelPhoneAnimated>
  ) : (
    <PanelDesktopAnimated state={state}>
      {showToggleButton && (
        <PanelToggleDesktop
          isExpanded={state !== PanelState.Closed && state !== PanelState.Tip}
          onClick={() => setState(nextPanelState(state))}
        />
      )}
      {showCloseButton && (
        <StyledCloseButton
          onClick={(event) => {
            setState(PanelState.Closed);
            onClose && onClose(event);
          }}
        />
      )}
      <DesktopPanelInner panelState={state} ref={ref}>
        {children}
      </DesktopPanelInner>
    </PanelDesktopAnimated>
  );
}
