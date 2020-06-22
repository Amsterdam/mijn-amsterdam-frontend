import classnames from 'classnames';
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDebouncedCallback } from 'use-debounce';
import { withKeyPress } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types';
import { IconChevronRight } from '../../assets/icons';
import { trackEvent, useSessionStorage } from '../../hooks';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './SectionCollapsible.module.scss';

export interface SectionCollapsibleProps {
  id: string;
  title?: string | ReactNode;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: string;
  isLoading?: boolean;
  track?: { category: string; name: string };
  hasItems?: boolean;
  children: ComponentChildren;
}

export interface SectionCollapsibleHeadingProps {
  hasItems: boolean;
  children: ComponentChildren;
  toggleCollapsed: (event: any) => void;
  isAriaExpanded: boolean;
}

export function SectionCollapsibleHeading({
  children,
  hasItems,
  toggleCollapsed,
  isAriaExpanded,
}: SectionCollapsibleHeadingProps) {
  return (
    <Heading
      size="mediumLarge"
      className={classnames(styles.Title, hasItems && styles.TitleWithItems)}
    >
      {hasItems ? (
        <button
          aria-expanded={isAriaExpanded}
          className={styles.TitleToggle}
          onKeyPress={event => hasItems && toggleCollapsed(event)}
          onClick={event => hasItems && toggleCollapsed(event)}
        >
          <IconChevronRight aria-hidden="true" className={styles.CaretIcon} />{' '}
          {children}
        </button>
      ) : (
        <>
          <IconChevronRight aria-hidden="true" className={styles.CaretIcon} />{' '}
          {children}
        </>
      )}
    </Heading>
  );
}

interface SectionCollapsibleBodyProps {
  children: ComponentChildren;
  isCollapsed: boolean;
  className?: string;
}

export function SectionCollapsibleBody({
  children,
  isCollapsed,
  className,
}: SectionCollapsibleBodyProps) {
  const classes = classnames(
    styles.SectionCollapsible,
    isCollapsed && styles.isCollapsed,
    className
  );
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
  track,
  children,
}: SectionCollapsibleProps) {
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isReadyForAnimation, setReadyForAnimaton] = useState(false);
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;

  const [setReadyForAnimatonDebounced] = useDebouncedCallback(() => {
    if (!isLoading && isReadyForAnimation === false) {
      setReadyForAnimaton(true);
    }
  }, 50);

  setReadyForAnimatonDebounced();

  const [{ height: contentHeight }, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!isLoading && hasItems && contentRef && contentRef.current) {
      setDimensions(contentRef.current.getBoundingClientRect());
    }
  }, [isLoading, hasItems]);

  const toggleCollapsed = withKeyPress<HTMLSpanElement>(() => {
    if (isCollapsed && track) {
      trackEvent({
        ...track,
        action: 'Open klikken',
      });
    }
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
    <SectionCollapsibleBody isCollapsed={isCollapsed}>
      {hasTitle && (
        <SectionCollapsibleHeading
          isAriaExpanded={!isCollapsed}
          toggleCollapsed={toggleCollapsed}
          hasItems={hasItems}
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
      {hasNoItemsMessage && !isLoading && !hasItems && (
        <p className={styles.NoItemsMessage}>{noItemsMessage}</p>
      )}

      {!isLoading && hasItems && (
        <animated.div
          aria-hidden={isCollapsed}
          className={styles.Panel}
          style={heightAnimSpring}
        >
          <div className={styles.PanelInner} ref={contentRef}>
            {children}
          </div>
        </animated.div>
      )}
    </SectionCollapsibleBody>
  );
}
