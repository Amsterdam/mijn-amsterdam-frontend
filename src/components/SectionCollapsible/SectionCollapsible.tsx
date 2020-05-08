import React, { useState, useEffect } from 'react';
import { ComponentChildren } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { withKeyPress } from 'helpers/App';

import Heading from '../Heading/Heading';
import styles from './SectionCollapsible.module.scss';
import { trackEvent } from 'hooks/analytics.hook';
import { useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDebouncedCallback } from 'use-debounce';
import { useSessionStorage } from 'hooks/storage.hook';

export interface SectionCollapsibleProps {
  id: string;
  title?: string;
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
          <CaretIcon aria-hidden="true" className={styles.CaretIcon} />{' '}
          {children}
        </button>
      ) : (
        <>
          <CaretIcon aria-hidden="true" className={styles.CaretIcon} />{' '}
          {children}
        </>
      )}
    </Heading>
  );
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

  const classes = classnames(
    styles.SectionCollapsible,
    (!hasItems || isCollapsed) && styles.isCollapsed,
    className
  );

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
    <section className={classes}>
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
    </section>
  );
}
