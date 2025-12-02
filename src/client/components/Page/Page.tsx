import { HTMLProps, ReactNode, type ReactElement } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
  Heading,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './Page.module.scss';
import type { ThemaMenuItem } from '../../config/thema-types';
import { getRedactedClass } from '../../helpers/cobrowse';
import {
  PageBreadcrumbsV2,
  type PageBreadcrumbsV2Props,
} from '../PageHeading/PageHeadingV2';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  heading: ReactElement | string;
  isWide?: boolean;
  showBreadcrumbs?: boolean;
  redactedThemaId?: string | null;
  redactedScope?: Required<ThemaMenuItem>['redactedScope'];
  breadcrumbs?: PageBreadcrumbsV2Props['breadcrumbs'];
}

const PADDING_TOP = 'large';
const PADDING_BOTTOM = 'x-large';

export function PageV2({
  className,
  heading,
  children,
  isWide = false,
  showBreadcrumbs = true,
  redactedThemaId,
  redactedScope = 'full',
  breadcrumbs,
}: PageProps) {
  return (
    <>
      {showBreadcrumbs && (
        <Grid paddingTop={PADDING_TOP}>
          <PageContentCell startWide={1} spanWide={12}>
            <PageBreadcrumbsV2 breadcrumbs={breadcrumbs} pageTitle={heading} />
          </PageContentCell>
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
        <Grid
          className={classNames(
            getRedactedClass(redactedThemaId, redactedScope)
          )}
          paddingBottom={PADDING_BOTTOM}
        >
          {children}
        </Grid>
      </main>
    </>
  );
}

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
