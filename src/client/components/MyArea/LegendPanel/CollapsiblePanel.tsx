import {
  Children,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react';

import { Button } from '@amsterdam/design-system-react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
} from '@amsterdam/design-system-react-icons';

import styles from './PanelComponent.module.scss';

export enum CollapsedState {
  Expanded = 'Expanded',
  Collapsed = 'Collapsed',
}

export function isExpanded(state: CollapsedState) {
  return state === CollapsedState.Expanded;
}

export function isCollapsed(state: CollapsedState) {
  return !isExpanded(state);
}

interface MyAreaCollapsiblePanelHeadingProps {
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
  title: ReactNode;
  state?: CollapsedState;
}

export function MyAreaCollapsiblePanelHeading({
  onClick,
  title,
  state = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelHeadingProps) {
  return (
    <>
      {title}
      {onClick && (
        <Button
          className={styles.CollapsibleButton}
          onClick={onClick}
          aria-expanded={isExpanded(state)}
          aria-label={isExpanded(state) ? 'Sluit' : 'Open'}
          icon={isExpanded(state) ? ChevronDownIcon : ChevronRightIcon}
          variant="tertiary"
        />
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
  initialState = CollapsedState.Expanded,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(initialState);
  const hasChildren = Children.count(children) >= 1;
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
