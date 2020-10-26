import { Icon, themeColor, themeSpacing } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, useState, ReactNode } from 'react';
import styled from 'styled-components';
import { IconFilter } from '../../assets/icons';

const CollapsiblePanel = styled('div')`
  padding: ${themeSpacing(3, 0)};
  border-top: 1px solid ${themeColor('tint', 'level3')};
  &:last-child {
    border-bottom: 1px solid ${themeColor('tint', 'level3')};
  }
`;

const UnstyledButton = styled('button')`
  appearance: none;
  border: 0;
  padding: 0;
  font-size: 100%;
  font-family: inherit;
  background: none;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  visibility: hidden;
`;

const CollapsiblePanelContent = styled('div')`
  padding-left: ${themeSpacing(5)};
`;

const PanelHeadingElement = styled('h3')`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover > button {
    visibility: visible;
  }
`;

const PanelIcon = styled(Icon)`
  width: ${themeSpacing(6)};
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
    <PanelHeadingElement>
      {title}
      {onClick && (
        <UnstyledButton onClick={onClick} aria-expanded={isExpanded(state)}>
          <PanelIcon size={16}>
            <IconFilter />
          </PanelIcon>
        </UnstyledButton>
      )}
    </PanelHeadingElement>
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
  return (
    <CollapsiblePanel>
      <MyAreaCollapsiblePanelHeading
        title={title}
        onClick={
          !!children
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
      {children && isExpanded(collapsedState) && (
        <CollapsiblePanelContent>{children}</CollapsiblePanelContent>
      )}
    </CollapsiblePanel>
  );
}
