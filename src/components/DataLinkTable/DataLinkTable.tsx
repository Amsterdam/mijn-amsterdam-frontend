import { Unshaped } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { entries, withKeyPress } from 'helpers/App';
import { useSessionStorage } from 'hooks/storage.hook';
import React, { useState, useEffect } from 'react';

import Heading from '../Heading/Heading';
import styles from './DataLinkTable.module.scss';
import {
  itemClickTogglePayload,
  itemClickPayload,
  trackItemPresentation,
} from 'hooks/matomo.hook';

const DEFAULT_TRACK_CATEGORY = 'Thema_Pagina';

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
  trackCategory: string;
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
  trackCategory = DEFAULT_TRACK_CATEGORY,
}: DataLinkTableProps) {
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);

  const hasItems = !!items.length;
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;

  const classes = classnames(
    styles.DataLinkTable,
    (!hasItems || isCollapsed) && styles.isCollapsed,
    className,
    rowHeight === 'auto' && styles.noTransition
  );

  const toggleCollapsed = withKeyPress<HTMLHeadingElement>(() =>
    setCollapsed(!isCollapsed)
  );

  // Setting an explicit height will result in a nice transition
  let cssCalcExpr = isCollapsed
    ? 0
    : `calc((${items.length} * ${rowHeight}) + 1.5rem)`; // 1.5rem being the base height of the thead

  // Vary the transition duration between 300 and 600ms
  let cssTransitionDurationMS = `${Math.min(
    Math.max(items.length * 60, 300),
    600
  )}ms`;

  if (rowHeight === 'auto') {
    cssCalcExpr = isCollapsed ? 0 : 'auto';
    cssTransitionDurationMS = '0ms';
  }

  useEffect(() => {
    trackItemPresentation(
      `${trackCategory}/DataLink_tabel`,
      'Inhoud',
      isCollapsed ? 'dicht' : 'open'
    );
  }, []);

  return (
    <div className={classes}>
      {hasTitle && (
        <Heading
          size="mediumLarge"
          role="button"
          tabIndex={!hasItems ? -1 : 0}
          className={styles.Title}
          onKeyPress={event => hasItems && toggleCollapsed(event)}
          onClick={event => hasItems && toggleCollapsed(event)}
          data-track={itemClickTogglePayload(
            `${trackCategory}`,
            'DataLink_tabel_titel',
            isCollapsed ? 'dicht' : 'open'
          )}
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
            height: cssCalcExpr,
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
                    <ButtonLink
                      to={item.link.to}
                      data-track={itemClickPayload(
                        `${trackCategory}/DataLink_tabel`,
                        'DataLink'
                      )}
                    >
                      {item.title}
                    </ButtonLink>
                  </td>
                  {displayProps &&
                    entries(displayProps).map(([key, label]) => (
                      <td key={key} className={styles.DisplayProp}>
                        <span className={styles.DisplayPropLabel}>
                          {label}:
                        </span>
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
