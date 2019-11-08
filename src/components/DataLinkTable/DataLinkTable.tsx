import { LinkProps } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import Linkd from 'components/Button/Button';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { entries, withKeyPress } from 'helpers/App';
import { useSessionStorage } from 'hooks/storage.hook';
import React from 'react';

import Heading from '../Heading/Heading';
import styles from './DataLinkTable.module.scss';
import { trackEvent } from 'hooks/analytics.hook';
import { useRef } from 'react';
import useComponentSize from '@rehooks/component-size';
import { CSSTransition } from 'react-transition-group';

const DEFAULT_TRACK_CATEGORY = 'Thema Pagina';

export interface DataLinkTableProps {
  id: string;
  items: Array<{
    title: string | JSX.Element;
    link: LinkProps;
    [key: string]: any;
  }>;
  title?: string;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: any;
  displayProps?: { [key: string]: string }; // key => Label. Will be displayed right of the title in the table
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
  isLoading = true,
  trackCategory = DEFAULT_TRACK_CATEGORY,
}: DataLinkTableProps) {
  const tableRef = useRef(null);
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);
  const { height: tableHeight } = useComponentSize(tableRef);

  const hasItems = !!items.length;
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;

  const classes = classnames(
    styles.DataLinkTable,
    (!hasItems || isCollapsed) && styles.isCollapsed,
    className
  );

  const toggleCollapsed = withKeyPress<HTMLHeadingElement>(() => {
    if (isCollapsed) {
      trackEvent({
        category: trackCategory,
        name: 'Datatabel',
        action: 'Open klikken',
      });
    }
    setCollapsed(!isCollapsed);
  });

  const displayPropEntries = displayProps
    ? entries(displayProps).slice('title' in displayProps ? 1 : 0) // Don't use the title here, title is always fixed as first prop in the table;
    : [];

  // Setting an explicit height will result in a nice transition
  let cssCalcExpr = `${isCollapsed ? 0 : tableHeight}px`; // 1.5rem being the base height of the thead

  return (
    <div className={classes}>
      {hasTitle && (
        <Heading
          size="mediumLarge"
          className={classnames(
            styles.Title,
            hasItems && styles.TitleWithItems
          )}
          onKeyPress={event => hasItems && toggleCollapsed(event)}
          onClick={event => hasItems && toggleCollapsed(event)}
          {...(hasItems ? { role: 'button', tabIndex: 0 } : {})}
        >
          <CaretIcon aria-hidden="true" className={styles.CaretIcon} /> {title}
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
        <CSSTransition timeout={0} in={isCollapsed} classNames="dataLinkTable">
          <div
            aria-hidden={isCollapsed}
            className={styles.Panel}
            style={{
              height: cssCalcExpr,
            }}
          >
            <table className={styles.Table} ref={tableRef}>
              <thead>
                <tr className={styles.TableRow}>
                  <th className={styles.DisplayProp}>
                    {(displayProps && displayProps.title) || ' '}
                  </th>
                  {displayPropEntries.map(([, label]) => (
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
                      <Linkd
                        tabIndex={isCollapsed ? -1 : 0}
                        href={item.link.to}
                      >
                        {item.title}
                      </Linkd>
                    </td>
                    {displayPropEntries.map(([key, label]) => (
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
        </CSSTransition>
      )}
    </div>
  );
}
