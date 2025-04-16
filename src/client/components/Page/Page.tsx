import { HTMLProps, ReactNode } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
} from '@amsterdam/design-system-react';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export function PageV2({ className, children, id, ...otherProps }: PageProps) {
  return <>{children}</>;
}

export function TextPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2 id={id} className={className}>
      {children}
    </PageV2>
  );
}

export function OverviewPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2 id={id} className={className}>
      {children}
    </PageV2>
  );
}

export function DetailPageV2({ children, className, id }: PageProps) {
  return (
    <PageV2 id={id} className={className}>
      {children}
    </PageV2>
  );
}

export function PageContentV2({ children, className, id }: PageProps) {
  return (
    <Grid id={id} className={className}>
      {children}
    </Grid>
  );
}

type PageContentCellProps = {
  className?: string;
  children: ReactNode;
  start?: GridColumnNumbers;
  startWide?: GridColumnNumber;
  span?: GridColumnNumbers;
  spanWide?: GridColumnNumber;
};

export function PageContentCell({
  children,
  className,
  start = { narrow: 1, medium: 1, wide: 1 },
  span = { narrow: 4, medium: 8, wide: 12 },
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
    <Grid.Cell start={start_} span={span_} className={className}>
      {children}
    </Grid.Cell>
  );
}
