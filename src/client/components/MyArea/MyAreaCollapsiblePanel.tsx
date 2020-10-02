import { ChevronRight } from '@datapunt/asc-assets';
import { Icon, themeColor, themeSpacing } from '@datapunt/asc-ui';
import React, { PropsWithChildren, useState } from 'react';
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
  width: 26px;
  transition: transform 100ms linear;
  transform-origin: center;
`;

export enum CollapsedState {
  Expanded,
  Collapsed,
}

function isExpanded(state: CollapsedState) {
  return state === CollapsedState.Expanded;
}

interface MyAreaCollapsiblePanelHeadingProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  title: string;
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
        <PanelIcon rotate={state === CollapsedState.Collapsed ? 0 : 90}>
          <ChevronRight />
        </PanelIcon>
        {title}
      </UnstyledButton>
    </PanelHeadingElement>
  );
}

type MyAreaCollapsiblePanelProps = PropsWithChildren<{
  title: string;
  state?: CollapsedState;
}>;

export default function MyAreaCollapsiblePanel({
  children,
  title,
  state = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(state);
  return (
    <CollapsiblePanel>
      <MyAreaCollapsiblePanelHeading
        title={title}
        onClick={(event) =>
          setCollapsedState(
            isExpanded(collapsedState)
              ? CollapsedState.Collapsed
              : CollapsedState.Expanded
          )
        }
        state={collapsedState}
      />
      {isExpanded(collapsedState) && (
        <CollapsiblePanelContent>{children}</CollapsiblePanelContent>
      )}
    </CollapsiblePanel>
  );
}
