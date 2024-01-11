import { Button, Heading } from '@amsterdam/design-system-react';
import { ReactNode, useState } from 'react';
import styles from './CollapsiblePanel.module.scss';

interface CollapsiblePanelHeadingProps {
  toggle: () => void;
  title: string;
  isCollapsed: boolean;
  buttonLabelExpanded?: string;
  buttonLabelCollapsed?: string;
}

export function CollapsiblePanelHeading({
  isCollapsed,
  toggle,
  title,
  buttonLabelExpanded = 'Verberg',
  buttonLabelCollapsed = 'Toon',
}: CollapsiblePanelHeadingProps) {
  return (
    <div className={styles.CollapsiblePanelHeading}>
      <Heading level={3} size="level-2">
        {title}
      </Heading>
      <Button variant="tertiary" onClick={() => toggle()}>
        {isCollapsed ? buttonLabelCollapsed : buttonLabelExpanded}
      </Button>
    </div>
  );
}

type CollapsiblePanelProps = Omit<
  CollapsiblePanelHeadingProps,
  'toggle' | 'isCollapsed'
> & {
  title: CollapsiblePanelHeadingProps['title'];
  startCollapsed?: boolean;
  children: ReactNode;
};

export function CollapsiblePanel({
  title,
  children,
  startCollapsed = true,
}: CollapsiblePanelProps) {
  const [isCollapsed, toggleCollapsed] = useState<boolean>(startCollapsed);
  return (
    <>
      <CollapsiblePanelHeading
        title={title}
        toggle={() => toggleCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      {!isCollapsed && (
        <div className={styles.CollapsiblePanel}>{children}</div>
      )}
    </>
  );
}
