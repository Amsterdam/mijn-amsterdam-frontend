import React from 'react';
import { ComponentChildren } from 'App.types';
import DataTable, { DataTableProps } from 'components/DataTable/DataTable';
import Linkd from 'components/Button/Button';

export interface ComponentProps extends DataTableProps {
  children?: ComponentChildren;
  items: any[];
}

export default function DataLinkTable({
  children,
  items,
  titleKey = 'title',
  ...props
}: ComponentProps) {
  const itemsWithTitleLink = items.map(item => {
    return {
      ...item,
      [titleKey]: <Linkd href={item.link.to}>{item[titleKey]}</Linkd>,
    };
  });

  return (
    <DataTable {...props} items={itemsWithTitleLink}>
      {children}
    </DataTable>
  );
}
