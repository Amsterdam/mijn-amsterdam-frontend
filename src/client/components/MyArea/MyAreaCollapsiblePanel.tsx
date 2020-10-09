import { ChevronRight } from '@amsterdam/asc-assets';
import { Icon, themeColor, themeSpacing } from '@amsterdam/asc-ui';
import React, { PropsWithChildren, useState, ReactNode } from 'react';
import styled from 'styled-components';

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
`;

const CollapsiblePanelContent = styled('div')`
  padding-left: ${themeSpacing(5)};
`;

const PanelHeadingElement = styled('h3')`
  margin: 0;
`;

const PanelIcon = styled(Icon)`
  width: ${themeSpacing(6)};
  transition: transform 100ms linear;
  transform-origin: center;
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
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
      <UnstyledButton onClick={onClick} aria-expanded={isExpanded(state)}>
        <PanelIcon
          // size={12}
          rotate={state === CollapsedState.Collapsed ? 0 : 90}
        >
          <ChevronRight />
        </PanelIcon>
        {title}
      </UnstyledButton>
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
        onClick={(event: any) => {
          if (event.target.localName === 'input') {
            return;
          }
          setCollapsedState(
            isExpanded(collapsedState)
              ? CollapsedState.Collapsed
              : CollapsedState.Expanded
          );
        }}
        state={collapsedState}
      />
      {isExpanded(collapsedState) && (
        <CollapsiblePanelContent>{children}</CollapsiblePanelContent>
      )}
    </CollapsiblePanel>
  );
}
