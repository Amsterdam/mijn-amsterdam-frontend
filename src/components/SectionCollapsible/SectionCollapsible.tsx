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

export interface SectionCollapsibleProps {
  title?: string;
  noItemsMessage?: string;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  className?: string;
  isLoading?: boolean;
  track?: { category: string; name: string };
  hasItems?: boolean;
  children: ComponentChildren;
}

export default function SectionCollapsible({
  title = '',
  noItemsMessage = '',
  isCollapsed,
  onToggleCollapsed,
  className,
  isLoading = false,
  hasItems = true,
  track,
  children,
}: SectionCollapsibleProps) {
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
    onToggleCollapsed && onToggleCollapsed();
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
        <Heading
          size="mediumLarge"
          className={classnames(
            styles.Title,
            hasItems && styles.TitleWithItems
          )}
        >
          {hasItems ? (
            <button
              aria-expanded={!isCollapsed}
              className={styles.TitleToggle}
              onKeyPress={event => hasItems && toggleCollapsed(event)}
              onClick={event => hasItems && toggleCollapsed(event)}
            >
              <CaretIcon aria-hidden="true" className={styles.CaretIcon} />{' '}
              {title}
            </button>
          ) : (
            <>
              <CaretIcon aria-hidden="true" className={styles.CaretIcon} />{' '}
              {title}
            </>
          )}
        </Heading>
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
          {/* paddingBottom to prevent margin collapsing */}
          <div className={styles.PanelInner} ref={contentRef}>
            {children}
          </div>
        </animated.div>
      )}
    </section>
  );
}
