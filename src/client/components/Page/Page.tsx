import { HTMLProps } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
} from '@amsterdam/design-system-react';
import composeClassNames from 'classnames';

import styles from './Page.module.scss';
import { ComponentChildren } from '../../../universal/types';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ComponentChildren;
}

export function PageV2({ className, children, id, ...otherProps }: PageProps) {
  const classNames = composeClassNames(styles.PageV2, className);

  return (
    <main
      {...otherProps}
      id={id}
      className={composeClassNames('ams-screen ams-screen--wide', classNames)}
    >
      {children}
    </main>
  );
}

export function TextPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2 id={id} className={composeClassNames(styles.TextPage, className)}>
      {children}
    </PageV2>
  );
}

export function OverviewPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2
      id={id}
      className={composeClassNames(styles.OverviewPage, className)}
    >
      {children}
    </PageV2>
  );
}

export function DetailPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2 id={id} className={composeClassNames(styles.DetailPage, className)}>
      {children}
    </PageV2>
  );
}

export function PageContentV2({ children, className, id }: PageProps) {
  return (
    <Grid id={id} className={composeClassNames(styles.PageContent, className)}>
      {children}
    </Grid>
  );
}

type PageContentCellProps = {
  className?: string;
  children: ComponentChildren;
  start?: GridColumnNumbers;
  startWide?: GridColumnNumber;
  span?: GridColumnNumbers;
  spanWide?: GridColumnNumber;
};

export function PageContentCell({
  children,
  className,
  start = { narrow: 1, medium: 1, wide: 2 },
  span = { narrow: 4, medium: 6, wide: 11 },
  spanWide,
  startWide,
}: PageContentCellProps) {
  let span_ = span;
  if (spanWide) {
    span_ = { ...span, wide: spanWide };
  }
  let start_ = start;
  if (startWide) {
    start_ = { ...start, wide: startWide };
  }
  return (
    <Grid.Cell
      start={start_}
      span={span_}
      className={composeClassNames(styles.PageContentCell, className)}
    >
      {children}
    </Grid.Cell>
  );
}
