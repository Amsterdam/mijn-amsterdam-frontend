import { LinkProps } from 'App.types';
import Linkd from 'components/Button/Button';
import { entries } from 'helpers/App';
import React, { useState } from 'react';

import styles from './DataLinkTable.module.scss';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';

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
  track: {
    category: string;
    name: string;
  };
}

export default function DataLinkTable({
  noItemsMessage,
  items,
  displayProps,
  startCollapsed,
  id,
  title,
  isLoading,
  track,
}: DataLinkTableProps) {
  const [isCollapsed, setCollapsed] = useState(startCollapsed);

  const displayPropEntries = displayProps
    ? entries(displayProps).slice('title' in displayProps ? 1 : 0) // Don't use the title here, title is always fixed as first prop in the table;
    : [];

  return (
    <SectionCollapsible
      className={styles.DataLinkTable}
      id={id}
      title={title}
      startCollapsed={startCollapsed}
      noItemsMessage={noItemsMessage}
      isLoading={isLoading}
      hasItems={!!items.length}
      track={track}
      onToggleCollapsed={isCollapsed => setCollapsed(isCollapsed)}
    >
      <table className={styles.Table}>
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
                <Linkd tabIndex={isCollapsed ? -1 : 0} href={item.link.to}>
                  {item.title}
                </Linkd>
              </td>
              {displayPropEntries.map(([key, label]) => (
                <td key={key} className={styles.DisplayProp}>
                  <span className={styles.DisplayPropLabel}>{label}:</span>
                  {item[key] || <span>&mdash;</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCollapsible>
  );
}
