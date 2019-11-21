import { ComponentChildren } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { withKeyPress } from 'helpers/App';
import { useSessionStorage } from 'hooks/storage.hook';
import React, { useEffect } from 'react';

import Heading from '../Heading/Heading';
import styles from './SectionCollapsible.module.scss';
import { trackEvent } from 'hooks/analytics.hook';
import { useRef } from 'react';
import useComponentSize from '@rehooks/component-size';
import { CSSTransition } from 'react-transition-group';

export interface SectionCollapsibleProps {
  id: string;
  title?: string;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: any;
  isLoading?: boolean;
  track?: { category: string; name: string };
  onToggleCollapsed?: (isCollapsed: boolean) => void;
  hasItems?: boolean;
  children: ComponentChildren;
}

export default function SectionCollapsible({
  id,
  title = '',
  noItemsMessage = '',
  startCollapsed = true,
  className,
  onToggleCollapsed,
  isLoading = false,
  hasItems = true,
  track,
  children,
}: SectionCollapsibleProps) {
  const contentRef = useRef(null);
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);
  const { height: contentHeight } = useComponentSize(contentRef);
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;

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
    onToggleCollapsed && onToggleCollapsed(!isCollapsed);
  });

  // Let the outside world know the collapsed state of the component initially
  useEffect(() => {
    onToggleCollapsed && onToggleCollapsed(isCollapsed);
  }, []);

  let cssCalcExpr = `${isCollapsed ? 0 : contentHeight}px`;

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
          <CaretIcon aria-hidden="true" className={styles.CaretIcon} />{' '}
          <span
            {...(hasItems ? { role: 'button', tabIndex: 0 } : {})}
            onKeyPress={event => hasItems && toggleCollapsed(event)}
            onClick={event => hasItems && toggleCollapsed(event)}
          >
            {title}
          </span>
        </Heading>
      )}
      {isLoading && (
        <LoadingContent
          barConfig={[['auto', '2rem', '1rem'], ['auto', '2rem', '0']]}
        />
      )}
      {hasNoItemsMessage && !isLoading && !hasItems && (
        <p className={styles.NoItemsMessage}>{noItemsMessage}</p>
      )}

      {!isLoading && hasItems && (
        <CSSTransition
          timeout={0}
          in={isCollapsed}
          classNames="sectionCollapsible"
        >
          <div
            aria-hidden={isCollapsed}
            className={styles.Panel}
            style={{
              height: cssCalcExpr,
            }}
          >
            <div ref={contentRef}>{children}</div>
          </div>
        </CSSTransition>
      )}
    </section>
  );
}
