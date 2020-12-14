import { Icon } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import styled from 'styled-components';
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
  transition: transform 80ms linear;
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
}

function MyAreaCollapsiblePanelHeading({
  onClick,
  title,
  state = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelHeadingProps) {
  return (
    <>
      {title}
      {onClick && (
        <ToggleButton onClick={onClick} aria-expanded={isExpanded(state)}>
          <Icon size={16}>
            <IconChevronRight />
          </Icon>
        </ToggleButton>
      )}
    </>
  );
}

type MyAreaCollapsiblePanelProps = PropsWithChildren<{
  title: ReactNode;
  initialState?: CollapsedState;
}>;

export default function MyAreaCollapsiblePanel({
  children,
  title,
  initialState = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(initialState);
  const hasChildren = React.Children.count(children) >= 1;
  return (
    <>
      <MyAreaCollapsiblePanelHeading
        title={title}
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
