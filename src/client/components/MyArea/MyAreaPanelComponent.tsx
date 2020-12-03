import { themeSpacing } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useComponentSize } from '../../hooks/useComponentSize';

const Panel = styled.div<{ isOpen: boolean }>`
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 9999999;
  transition: transform 200ms ease-in-out, height 200ms ease-in-out;
  max-height: 100%;
  height: auto;
`;

const PanelDesktop = styled(Panel)`
  width: 30rem;
  top: 0;
  padding: ${themeSpacing(8)};
  transform: ${({ isOpen }) =>
    isOpen ? 'translateX(0)' : 'translateX(calc(-100% + 30px))'};
  overflow-y: auto;
`;

const PanelPhone = styled(Panel)<{ height: string }>`
  right: 0;
  z-index: 999;
  padding: ${themeSpacing(2, 4, 2, 4)};
  height: ${({ height }) => height};
  transform: ${({ isOpen }) =>
    isOpen ? `translateY(0)` : `translateY(calc(100% - 30px))`};
`;

const PanelInner = styled.div`
  position: relative;
  min-height: 100%;
`;

const PanelToggle = styled.button`
  border: 0;
  background: #ccc;
  padding: 0;
  appearance: none;
  display: block;
  border-radius: 5px;
`;

const PanelToggleDesktop = styled(PanelToggle)`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 10px;
  height: 100px;
`;

const PanelTogglePhone = styled(PanelToggle)`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 10px;
`;

type PanelComponentProps = PropsWithChildren<{
  isOpenInitial?: boolean;
}>;

export function PanelComponent({
  children,
  isOpenInitial = false,
}: PanelComponentProps) {
  const [isOpen, setIsOpen] = useState(isOpenInitial);
  const isPhone = usePhoneScreen();
  const ref = useRef<HTMLDivElement | null>(null);
  const { height } = useComponentSize(ref.current);
  const [domHeight] = useDebounce(height, 1000);
  const panelHeight = useMemo(() => {
    return `auto`;
  }, [domHeight]);
  console.log('height', height, domHeight, panelHeight);
  return isPhone ? (
    <PanelPhone height={panelHeight} isOpen={isOpen}>
      <PanelTogglePhone onClick={() => setIsOpen(!isOpen)} />
      <PanelInner ref={ref}>{children}</PanelInner>
    </PanelPhone>
  ) : (
    <PanelDesktop isOpen={isOpen}>
      <PanelToggleDesktop onClick={() => setIsOpen(!isOpen)} />
      <PanelInner>{children}</PanelInner>
    </PanelDesktop>
  );
}
