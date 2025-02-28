import {
  Children,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react';

import { ChevronRightIcon } from '@amsterdam/design-system-react-icons';

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

function MyAreaCollapsiblePanelHeading({
  onClick,
  title,
  state = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelHeadingProps) {
  return (
    <>
      {title}
      {onClick && (
        <button
          className={styles.CollapsibleButton}
          onClick={onClick}
          aria-expanded={isExpanded(state)}
        >
          <ChevronRightIcon aria-hidden="true" className={styles.CaretIcon} />
        </button>
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
