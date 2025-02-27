import { ReactNode, useRef, useState } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { animated, useSpring } from '@react-spring/web';
import classnames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';

import styles from './SectionCollapsible.module.scss';
import { ComponentChildren } from '../../../universal/types';
import { IconChevronRight } from '../../assets/icons';
import { withKeyPress } from '../../helpers/utils';
import { useSessionStorage } from '../../hooks/storage.hook';
import { useContentDimensions } from '../../hooks/useContentDimensions';
import LoadingContent from '../LoadingContent/LoadingContent';

export interface SectionCollapsibleProps {
  id: string;
  title?: string | ReactNode;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: string;
  isLoading?: boolean;
  hasItems?: boolean;
  children: ComponentChildren;
}

export interface SectionCollapsibleHeadingProps {
  children: ComponentChildren;
  toggleCollapsed: (event: any) => void;
  isAriaExpanded: boolean;
}

export function SectionCollapsibleHeading({
  children,
  toggleCollapsed,
  isAriaExpanded,
}: SectionCollapsibleHeadingProps) {
  return (
    <Heading
      level={3}
      size="level-3"
      className={classnames(styles.Title, styles.TitleWithItems)}
    >
      <button
        aria-expanded={isAriaExpanded}
        className={styles.TitleToggle}
        onClick={(event) => toggleCollapsed(event)}
      >
        <IconChevronRight aria-hidden="true" className={styles.CaretIcon} />{' '}
        {children}
      </button>
    </Heading>
  );
}

interface SectionCollapsibleBodyProps {
  children: ComponentChildren;
  className?: string;
}

export function SectionCollapsibleBody({
  children,
  className,
}: SectionCollapsibleBodyProps) {
  const classes = classnames(styles.SectionCollapsible, className);
  return <section className={classes}>{children}</section>;
}

export default function SectionCollapsible({
  id,
  title = '',
  noItemsMessage = '',
  startCollapsed = true,
  className,
  isLoading = false,
  hasItems = true,
  children,
}: SectionCollapsibleProps) {
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isReadyForAnimation, setReadyForAnimaton] = useState(false);
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;
  const { height: contentHeight } = useContentDimensions(contentRef);

  const DEBOUNCE_MS = 50;
  const setReadyForAnimatonDebounced = useDebouncedCallback(() => {
    if (!isLoading && isReadyForAnimation === false) {
      setReadyForAnimaton(true);
    }
  }, DEBOUNCE_MS);

  setReadyForAnimatonDebounced();

  const toggleCollapsed = withKeyPress<HTMLSpanElement>(() => {
    setCollapsed(!isCollapsed);
  });

  const heightAnim = {
    immediate: !isReadyForAnimation,
    reverse: isCollapsed,
    from: {
      height: 0,
    },
    height: contentHeight,
  };

  const heightAnimSpring = useSpring(heightAnim);

  return (
    <SectionCollapsibleBody className={className}>
      {hasTitle && (
        <SectionCollapsibleHeading
          isAriaExpanded={!isCollapsed}
          toggleCollapsed={toggleCollapsed}
        >
          {title}
        </SectionCollapsibleHeading>
      )}
      {isLoading && (
        <LoadingContent
          barConfig={[
            ['auto', '2rem', '1rem'],
            ['auto', '2rem', '0'],
          ]}
        />
      )}

      <animated.div
        aria-hidden={isCollapsed}
        className={styles.Panel}
        style={heightAnimSpring}
      >
        <div className={styles.PanelInner} ref={contentRef}>
          {hasNoItemsMessage && !isLoading && !hasItems && (
            <Paragraph className={styles.NoItemsMessage}>
              {noItemsMessage}
            </Paragraph>
          )}
          {hasItems && children}
        </div>
      </animated.div>
    </SectionCollapsibleBody>
  );
}
