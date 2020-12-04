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
  useState,
} from 'react';
import { animated, useSpring, UseSpringBaseProps } from 'react-spring';
import { atom, useRecoilState } from 'recoil';
import styled from 'styled-components';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useComponentSize } from '../../hooks/useComponentSize';
import { CloseButton } from '../Button/Button';

export enum PanelState {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Preview = 'PREVIEW',
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

const PanelDesktop = styled(Panel)`
  width: ${DESKTOP_PANEL_WIDTH}px;
  top: 0;
  transform: translateX(calc(-100% + ${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px));
  overflow-y: auto;
`;

export const PhonePanelPadding = {
  TOP: spacing * 10,
  RIGHT: spacing * 4,
  BOTTOM: spacing * 6,
  LEFT: spacing * 4,
};

export const PREVIEW_PANEL_HEIGHT = 32 * spacing;

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
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  zIndex?: number;
  isActive?: boolean;
}>;

export function PanelContent({
  zIndex = 1,
  isActive = true,
  children,
  onClose,
}: PanelContentProps) {
  return (
    <StyledPanelContent zIndex={zIndex} isActive={isActive}>
      {!!onClose && (
        <CloseButton style={{ float: 'right' }} onClick={onClose} />
      )}
      {children}
    </StyledPanelContent>
  );
}

type PanelDesktopAnimatedProps = PropsWithChildren<{
  state: PanelState;
}>;

function PanelDesktopAnimated({ state, children }: PanelDesktopAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform:
      state === PanelState.Closed
        ? `translateX(calc(-100% + ${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px))`
        : 'translateX(calc(0% + 0px))',
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
  let transform = `translateY(calc(100% - ${PhonePanelPadding.TOP}px))`;

  switch (state) {
    case PanelState.Preview:
      transform = `translateY(calc(100% - ${PREVIEW_PANEL_HEIGHT}px))`;
      break;
    case PanelState.Open:
      transform = 'translateY(calc(0% - 0px))';
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

const panelStateAtom = atom<PanelState>({
  key: 'myAreaPanelState',
  default: PanelState.Closed,
});

export function usePanelState() {
  return useRecoilState(panelStateAtom);
}

export type PanelComponentProps = PropsWithChildren<{
  initialState: PanelState;
  onTogglePanel?: (state: PanelState, panelheight?: number) => void;
}>;

export function PanelComponent({
  children,
  initialState = PanelState.Closed,
  onTogglePanel,
}: PanelComponentProps) {
  const [state, setState] = usePanelState();
  const isPhone = usePhoneScreen();
  const ref = useRef<HTMLDivElement | null>(null);
  const { height } = useComponentSize(ref.current);
  // const height = 610;

  const panelHeight = useMemo(() => {
    return height + PhonePanelPadding.TOP + PhonePanelPadding.BOTTOM;
  }, [height]);

  useEffect(() => {
    onTogglePanel && onTogglePanel(state, panelHeight);
  }, [state, onTogglePanel]);

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  function phonePanelState(state: PanelState): PanelState {
    if (state === PanelState.Preview) {
      return PanelState.Open;
    }
    return state === PanelState.Closed ? PanelState.Preview : PanelState.Closed;
  }

  function desktopPanelState(state: PanelState): PanelState {
    return state === PanelState.Closed ? PanelState.Open : PanelState.Closed;
  }

  useEffect(() => {
    if (state === PanelState.Closed) {
      ref?.current?.scrollTo(0, 0);
    }
  }, [state]);

  return isPhone ? (
    <PanelPhoneAnimated state={state} height={panelHeight}>
      <PanelTogglePhone
        aria-expanded={state !== PanelState.Closed}
        onClick={() => {
          setState(phonePanelState(state));
        }}
      />
      <PhonePanelInner panelState={state} ref={ref}>
        {children}
      </PhonePanelInner>
    </PanelPhoneAnimated>
  ) : (
    <PanelDesktopAnimated state={state}>
      <PanelToggleDesktop
        isExpanded={state !== PanelState.Closed}
        onClick={() => setState(desktopPanelState(state))}
      />
      <DesktopPanelInner panelState={state} ref={ref}>
        {children}
      </DesktopPanelInner>
    </PanelDesktopAnimated>
  );
}
