import { Unshaped } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import { entries, withKeyPress } from 'helpers/App';
import React, { useState } from 'react';

import Heading from '../Heading/Heading';
import styles from './DataLinkTable.module.scss';
import createPersistedState from 'use-persisted-state';
import LoadingContent from 'components/LoadingContent/LoadingContent';

export interface DataLinkTableProps {
  id: string;
  items?: Unshaped[];
  title?: string;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: any;
  displayProps?: { [key: string]: string }; // key => Label. Will be displayed right of the title in the table
  rowHeight?: 'auto' | string;
  isLoading: boolean;
}

export default function DataLinkTable({
  id,
  items = [],
  title = '',
  noItemsMessage = '',
  startCollapsed = true,
  className,
  displayProps,
  rowHeight = 'auto',
  isLoading = true,
}: DataLinkTableProps) {
  const [isCollapsed, setCollapsed] = createPersistedState(
    id,
    window.sessionStorage
  )(startCollapsed);

  const hasItems = !!items.length;
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;

  const classes = classnames(
    styles.DataLinkTable,
    (!hasItems || isCollapsed) && styles.isCollapsed,
    className
  );

  const toggleCollapsed = withKeyPress<HTMLHeadingElement>(() =>
    setCollapsed(!isCollapsed)
  );

  // Setting an explicit height will result in a nice transition
  const cssCalcExpr = isCollapsed
    ? 0
    : `calc((${items.length} * ${rowHeight}) + 1.5rem)`; // 1.5rem being the base height of the thead

  // Vary the transition duration between 300 and 600ms
  const cssTransitionDurationMS = `${Math.min(
    Math.max(items.length * 60, 300),
    600
  )}ms`;

  return (
    <div className={classes}>
      {hasTitle && (
        <Heading
          size="mediumLarge"
          role="button"
          className={styles.Title}
          tabIndex={0}
          onKeyPress={event => hasItems && toggleCollapsed(event)}
          onClick={event => hasItems && toggleCollapsed(event)}
        >
          <CaretIcon className={styles.CaretIcon} /> {title}
          {hasItems && <span>({items.length})</span>}
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
        <div
          aria-hidden={isCollapsed}
          className={styles.Panel}
          style={{
            height: rowHeight === 'auto' ? rowHeight : cssCalcExpr,
            transitionDuration: cssTransitionDurationMS,
          }}
        >
          <table className={styles.Table}>
            <thead>
              <tr className={styles.TableRow}>
                <th>&nbsp;</th>
                {displayProps &&
                  entries(displayProps).map(([, label]) => (
                    <th key={label} className={styles.DisplayProp}>
                      {label}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={styles.TableRow}>
                  <td className={styles.DisplayPropTitle}>
                    <ButtonLink to={item.link.to}>{item.title}</ButtonLink>
                  </td>
                  {displayProps &&
                    entries(displayProps).map(([key]) => (
                      <td key={key} className={styles.DisplayProp}>
                        {item[key] || <span>&mdash;</span>}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
