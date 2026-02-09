import { ReactNode } from 'react';

import { Unshaped, type LinkProps } from '../../../universal/types/App.types';

export type DisplayPropsBase<
  T,
  T2 = { detailLinkComponent: string } & T,
> = Readonly<{
  [Property in keyof T2]+?: string | number | ReactNode;
}>;

export type DisplayProps<T> =
  | DisplayPropsBase<T>
  | {
      props: DisplayPropsBase<T>;
      // colwidths can be used to set the width of each column in the table.
      // the array always has the size of the number of keys in the props object. e.g. if props has 4 keys, colWidths will have 4 values.
      // if a colWidth value is '0', the column will not be displayed and prop at entries(props) will be discarded. e.g.
      // props={ foo: 'bar', baz: 'world' } colWidths={{ large: ['50%', '50%'], small: ['100%', '0'] }} will only display the foo column on small screens and both columns on large screens.
      colWidths?: TableV2ColWidths;
    };

export type FilterPropsBase<T> = Readonly<{
  [Property in keyof T]+?: string | number | ReactNode;
}>;

export type FilterProps<T> = {
  search?: FilterPropsBase<T>;
  order?: FilterPropsBase<T>;
  filter?: FilterPropsBase<T>;
};

export type FilterOrderProps = {
  key?: string;
  direction?: string;
};

export type ScreenSize = 'small' | 'large';
export type TableV2ColWidths = Record<ScreenSize, string[]>;

export interface TableV2Props<T> {
  displayProps: DisplayProps<T>;
  filter?: FilterProps;
  currentOrder?: FilterOrderProps;
  onHeaderCellClick?: (key: FilterOrderProps['key']) => void;
  items: T[];
  className?: string;
  showTHead?: boolean;
  caption?: string;
  contentAfterTheCaption?: ReactNode;
}

export interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

export type WithDetailLinkComponent<T> = T & {
  detailLinkComponent?: ReactNode;
};
