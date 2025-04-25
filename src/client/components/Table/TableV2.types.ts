import { ReactNode } from 'react';

import { LinkProps } from 'react-router';

import { Unshaped } from '../../../universal/types';

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
