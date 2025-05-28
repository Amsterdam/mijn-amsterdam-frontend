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
      colWidths?: TableV2ColWidths;
    };

export type ScreenSize = 'small' | 'large';
export type TableV2ColWidths = Record<ScreenSize, string[]>;

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
