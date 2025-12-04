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
  ChevronForwardIcon,
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
  title: string;
  heading: ReactNode;
  state?: CollapsedState;
}

export function MyAreaCollapsiblePanelHeading({
  onClick,
  title,
  heading,
  state = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelHeadingProps) {
  return (
    <>
      {heading}
      {onClick && (
        <Button
          className={styles.CollapsibleButton}
          onClick={onClick}
          aria-expanded={isExpanded(state)}
          aria-label={
            isExpanded(state)
              ? `Sluit filters voor ${title}`
              : `Open filters voor ${title}`
          }
          icon={isExpanded(state) ? ChevronDownIcon : ChevronForwardIcon}
          variant="tertiary"
        />
      )}
    </>
  );
}

type MyAreaCollapsiblePanelProps = PropsWithChildren<{
  title: string;
  heading: ReactNode;
  initialState?: CollapsedState;
}>;

export default function MyAreaCollapsiblePanel({
  children,
  title,
  heading,
  initialState = CollapsedState.Collapsed,
}: MyAreaCollapsiblePanelProps) {
  const [collapsedState, setCollapsedState] = useState(initialState);
  const hasChildren = Children.count(children) >= 1;
  return (
    <>
      <MyAreaCollapsiblePanelHeading
        title={title}
        heading={heading}
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
