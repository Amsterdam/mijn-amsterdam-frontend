import { Icon } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { IconFilter } from '../../assets/icons';

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
  border: 1px solid #eee;
  width: 36px;
  height: 36px;
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
            <IconFilter />
          </Icon>
        </ToggleButton>
      )}
    </>
  );
}

type MyAreaCollapsiblePanelProps = PropsWithChildren<{
  title: ReactNode;
  initalState?: CollapsedState;
}>;

export default function MyAreaCollapsiblePanel({
  children,
  title,
  initalState = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(initalState);
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
