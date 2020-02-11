import { entries } from 'helpers/App';
import React from 'react';

import styles from './DataTable.module.scss';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { useSessionStorage } from 'hooks/storage.hook';

export interface DataTableProps {
  id: string;
  items: any[];
  title?: string;
  titleKey?: string;
  noItemsMessage?: string;
  startCollapsed?: boolean;
  className?: string;
  displayProps?: { [key: string]: string }; // key => Label. Will be displayed right of the title in the table
  isLoading: boolean;
  track: {
    category: string;
    name: string;
  };
}

export default function DataTable({
  // Message displayed if no items are provided to the component
  noItemsMessage,

  // Items displayed in the component
  items,

  // Key => Label pair. Only the values that are found for the key here are displayed in the table e.g
  // item: { foo: 'bar', 'hello': 'world' } and displayProps: { foo: 'Foo' } will only display the foo values with Foo as title in thead
  displayProps,

  // A boolean that indicates if a table should start in Collapsed or Expanded state
  startCollapsed,

  // Id of the table
  id,

  // Heading above the table
  title,

  // Used interally so the component knows when it can display items or noItemsMessage
  isLoading,

  // A category + name for tracking purposes
  track,

  // Component(s) that are displayed beneath the <table />
  children,

  // The first property to display in the table rows
  titleKey = 'title',
}: WithChildren<DataTableProps, ''>) {
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);

  const displayPropEntries = displayProps
    ? entries(displayProps).slice(titleKey in displayProps ? 1 : 0) // Don't use the title here, title is always fixed as first prop in the table;
    : [];

  return (
    <SectionCollapsible
      className={styles.DataTable}
      title={title}
      noItemsMessage={noItemsMessage}
      isLoading={isLoading}
      hasItems={!!items.length}
      track={track}
      isCollapsed={isCollapsed}
      onToggleCollapsed={() => setCollapsed(!isCollapsed)}
    >
      <table className={styles.Table}>
        <thead>
          <tr className={styles.TableRow}>
            <th className={styles.DisplayProp}>
              {(displayProps && displayProps[titleKey]) || ' '}
            </th>
            {displayPropEntries.map(([, label]) => (
              <th key={label} className={styles.DisplayProp}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className={styles.TableRow}>
              {!!item[titleKey] && (
                <td className={styles.DisplayPropTitle}>{item[titleKey]}</td>
              )}
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
      {children}
    </SectionCollapsible>
  );
}
