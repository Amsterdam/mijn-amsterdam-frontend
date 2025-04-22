import { ReactNode } from 'react';

import { Unshaped, type LinkProps } from '../../../universal/types/App.types';

export type DisplayProps<T> = Readonly<
  {
    [Property in keyof T]+?: string | number | ReactNode;
  } & { smallscreen?: Omit<DisplayProps<T>, 'smallscreen'> }
>;

export interface TableV2Props<T> {
  displayProps: DisplayProps<T>;
  items: T[];
  className?: string;
  showTHead?: boolean;
  caption?: string;
  subTitle?: ReactNode;
}

export interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

export type WithDetailLinkComponent<T> = T & {
  detailLinkComponent?: ReactNode;
};
