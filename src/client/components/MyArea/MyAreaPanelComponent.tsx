import { ChevronRight } from '@amsterdam/asc-assets';
import { Icon, themeColor, themeSpacing } from '@amsterdam/asc-ui';
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
import styled from 'styled-components';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useComponentSize } from '../../hooks/useComponentSize';
import { CloseButton } from '../Button/Button';

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
  width: 48rem;
  top: 0;
  padding: ${themeSpacing(8)};
  transform: translateX(calc(-100% + 30px));
  overflow-y: auto;
`;

const PanelPhone = styled(Panel)`
  right: 0;
  padding: ${themeSpacing(10, 4, 2, 4)};
  transform: translateY(calc(100% - ${themeSpacing(10)}));
`;

const PanelInner = styled.div`
  position: relative;
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
  height: ${themeSpacing(10)};

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
  width: 3rem;
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
  padding: 8px;
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
  isOpen: boolean;
}>;

function PanelDesktopAnimated({ isOpen, children }: PanelDesktopAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform: !isOpen
      ? `translateX(calc(-100% + 30px))`
      : 'translateX(calc(0% + 0px))',
    config: { mass: 0.3, tension: 400 },
  });
  return <PanelDesktop style={anim}>{children}</PanelDesktop>;
}

type PanelPhoneAnimatedProps = PropsWithChildren<{
  isOpen: boolean;
  height: number;
}>;

function PanelPhoneAnimated({
  isOpen,
  children,
  height,
}: PanelPhoneAnimatedProps) {
  const anim: CSSProperties & UseSpringBaseProps = useSpring({
    transform: !isOpen
      ? `translateY(calc(100% - 40px))`
      : 'translateY(calc(0% - 0px))',
    height,
    config: { mass: 0.3, tension: 400 },
  });
  return <PanelPhone style={anim}>{children}</PanelPhone>;
}

type PanelComponentProps = PropsWithChildren<{
  isOpen?: boolean;
  onTogglePanel?: (isOpen: boolean) => void;
}>;

export function PanelComponent({
  children,
  isOpen: isOpenInitial = false,
  onTogglePanel,
}: PanelComponentProps) {
  const [isOpen, setIsOpen] = useState(isOpenInitial);
  const isPhone = usePhoneScreen();
  const ref = useRef<HTMLDivElement | null>(null);
  const { height } = useComponentSize(ref.current);

  useEffect(() => {
    onTogglePanel && onTogglePanel(isOpen);
  }, [isOpen, onTogglePanel]);

  useEffect(() => {
    setIsOpen(isOpenInitial);
  }, [isOpenInitial]);

  return isPhone ? (
    <PanelPhoneAnimated isOpen={isOpen} height={height}>
      <PanelTogglePhone
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      />
      <PanelInner ref={ref}>{children}</PanelInner>
    </PanelPhoneAnimated>
  ) : (
    <PanelDesktopAnimated isOpen={isOpen}>
      <PanelToggleDesktop
        isExpanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <PanelInner>{children}</PanelInner>
    </PanelDesktopAnimated>
  );
}
