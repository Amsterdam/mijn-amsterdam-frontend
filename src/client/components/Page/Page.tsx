import { HTMLProps, ReactNode } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
  Heading,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './Page.module.scss';
import { PageBreadcrumbsV2 } from '../PageHeading/PageHeadingV2';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  heading: string;
  isWide?: boolean;
  showBreadcrumbs?: boolean;
}

const PADDING_TOP = 'large';
const PADDING_BOTTOM = 'x-large';

export function PageV2({
  className,
  heading,
  children,
  isWide = false,
  showBreadcrumbs = true,
}: PageProps) {
  return (
    <>
      {showBreadcrumbs && (
        <Grid paddingTop={PADDING_TOP}>
          <Grid.Cell
            span={{ narrow: 4, medium: 6, wide: 8 }}
            start={{ narrow: 1, medium: 1, wide: 2 }}
          >
            <PageBreadcrumbsV2 pageTitle={heading} />
          </Grid.Cell>
        </Grid>
      )}
      <main
        id="skip-to-id-AppContent"
        className={classNames(
          className,
          !isWide ? styles.PageMA : styles.PageMAWide
        )}
      >
        <Grid paddingTop={showBreadcrumbs ? undefined : PADDING_TOP}>
          <PageContentCell startWide={1} spanWide={12}>
            <Heading className="ams-mb-s" level={1}>
              {heading}
            </Heading>
          </PageContentCell>
        </Grid>
        <Grid paddingBottom={PADDING_BOTTOM}>{children}</Grid>
      </main>
    </>
  );
}

export const TextPageV2 = PageV2;
export const OverviewPageV2 = PageV2;
export const DetailPageV2 = PageV2;

export function PageContentV2({ children }: PageProps) {
  return <>{children}</>;
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
