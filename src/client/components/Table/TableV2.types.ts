import { ReactNode } from 'react';

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
