import { ReactNode, useState } from 'react';

import { Button, Heading } from '@amsterdam/design-system-react';

import styles from './CollapsiblePanel.module.scss';

interface CollapsiblePanelHeadingProps {
  isCollapsed: boolean;
  title: string;
  toggle: () => void;
  buttonLabelCollapsed?: string;
  buttonLabelExpanded?: string;
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
      <Heading level={3}>{title}</Heading>
      <Button
        aria-expanded={!isCollapsed}
        variant="tertiary"
        title={`${isCollapsed ? buttonLabelCollapsed : buttonLabelExpanded} inhoud over ${title}`}
        onClick={() => toggle()}
      >
        {isCollapsed ? buttonLabelCollapsed : buttonLabelExpanded}
      </Button>
    </div>
  );
}

type CollapsiblePanelProps = Omit<
  CollapsiblePanelHeadingProps,
  'toggle' | 'isCollapsed'
> & {
  children: ReactNode;
  title: CollapsiblePanelHeadingProps['title'];
  startCollapsed?: boolean;
  containsSubTitle?: boolean;
};

export function CollapsiblePanel({
  title,
  children,
  startCollapsed = true,
  containsSubTitle = false,
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
        <div
          className={
            containsSubTitle
              ? styles.CollapsiblePanelWithSubtitle
              : styles.CollapsiblePanel
          }
        >
          {children}
        </div>
      )}
    </>
  );
}
