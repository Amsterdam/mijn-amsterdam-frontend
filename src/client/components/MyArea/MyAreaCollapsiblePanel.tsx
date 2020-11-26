import { Icon } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { SVGComponent } from '../../../universal/types';
import { IconChevronRight } from '../../assets/icons';

export const ToggleButton = styled('button')`
  appearance: none;
  border: 0;
  padding: 0;
  font-size: 100%;
  font-family: inherit;
  background: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  width: 36px;
  height: 36px;
  transform: ${(props) => (props['aria-expanded'] ? 'rotate(90deg)' : 'none')};
  /* visibility: hidden; */
  &:hover,
  &:focus {
    visibility: visible;
  }
`;

export enum CollapsedState {
  Expanded,
  Collapsed,
}

export function isExpanded(state: CollapsedState) {
  return state === CollapsedState.Expanded;
}

export function isCollapsed(state: CollapsedState) {
  return !isExpanded(state);
}

interface MyAreaCollapsiblePanelHeadingProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  title: ReactNode;
  state?: CollapsedState;
  toggleIcon?: SVGComponent;
}

function MyAreaCollapsiblePanelHeading({
  onClick,
  title,
  state = CollapsedState.Collapsed,
  toggleIcon = IconChevronRight,
}: MyAreaCollapsiblePanelHeadingProps) {
  const ToggleIcon = toggleIcon;
  return (
    <>
      {title}
      {onClick && (
        <ToggleButton onClick={onClick} aria-expanded={isExpanded(state)}>
          <Icon size={16}>
            <ToggleIcon />
          </Icon>
        </ToggleButton>
      )}
    </>
  );
}

type MyAreaCollapsiblePanelProps = PropsWithChildren<{
  title: ReactNode;
  initialState?: CollapsedState;
  toggleIcon?: SVGComponent;
}>;

export default function MyAreaCollapsiblePanel({
  children,
  title,
  initialState = CollapsedState.Collapsed,
  toggleIcon,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(initialState);
  const hasChildren = React.Children.count(children) >= 1;
  return (
    <>
      <MyAreaCollapsiblePanelHeading
        title={title}
        toggleIcon={toggleIcon}
        onClick={
          hasChildren
            ? (event) => {
                setCollapsedState(
                  isExpanded(collapsedState)
                    ? CollapsedState.Collapsed
                    : CollapsedState.Expanded
                );
              }
            : undefined
        }
        state={collapsedState}
      />
      {hasChildren && isExpanded(collapsedState) && children}
    </>
  );
}
