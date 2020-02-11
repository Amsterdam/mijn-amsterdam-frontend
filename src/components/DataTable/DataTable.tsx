import React from 'react';

import styles from './DataTable.module.scss';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { useSessionStorage } from 'hooks/storage.hook';
import Table from 'components/Table/Table';
import Linkd from 'components/Button/Button';

export interface DataTableProps {
  id: string;
  items: any[];
  title?: string;
  titleKey?: string;
  hasTitleLink?: boolean;
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

  // The title item is a link component
  hasTitleLink = true,
}: WithChildren<DataTableProps, ''>) {
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);

  const itemsFinal = hasTitleLink
    ? items.map((item: any) => {
        return {
          ...item,
          [titleKey]: <Linkd href={item.link.to}>{item[titleKey]}</Linkd>,
        };
      })
    : items;

  return (
    <SectionCollapsible
      className={styles.DataTable}
      title={title}
      noItemsMessage={noItemsMessage}
      isLoading={isLoading}
      hasItems={!!itemsFinal.length}
      track={track}
      isCollapsed={isCollapsed}
      onToggleCollapsed={() => setCollapsed(!isCollapsed)}
    >
      <Table
        items={itemsFinal}
        titleKey={titleKey}
        displayProps={displayProps}
      />
      {children}
    </SectionCollapsible>
  );
}
