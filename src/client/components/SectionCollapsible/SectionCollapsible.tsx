import classnames from 'classnames';
import React, { useEffect, useRef, useState, ReactNode, useMemo } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDebouncedCallback } from 'use-debounce';
import { withKeyPress } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types';
import { IconChevronRight } from '../../assets/icons';
import { trackEvent, useSessionStorage } from '../../hooks';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './SectionCollapsible.module.scss';
import { useComponentSize } from '../../hooks/useComponentSize';

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
      size="mediumLarge"
      className={classnames(styles.Title, styles.TitleWithItems)}
    >
      <button
        aria-expanded={isAriaExpanded}
        className={styles.TitleToggle}
        onKeyPress={(event) => toggleCollapsed(event)}
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

  const size = useComponentSize(contentRef.current);

  const contentDimensions = useMemo(() => {
    return {
      width: size.width,
      height: size.height,
    };
  }, [size.height, size.width]);

  useEffect(() => {
    if (!isLoading && contentRef && contentRef.current) {
      setDimensions(contentDimensions);
    }
  }, [isLoading, contentDimensions]);

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
            <p className={styles.NoItemsMessage}>{noItemsMessage}</p>
          )}
          {hasItems && children}
        </div>
      </animated.div>
    </SectionCollapsibleBody>
  );
}
