import { HTMLProps, ReactNode, type ReactElement } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
  Heading,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';

import type { RecordStr2 } from '../../../server/routing/route-helpers';
import { getRedactedClass, type ScopeRequested } from '../../helpers/cobrowse';
import {
  PageBreadcrumbsV2,
  type PageBreadcrumbsV2Props,
} from '../PageHeading/PageHeadingV2';
import { InlineKTO } from '../UserFeedback/InlineKTO';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  heading: ReactElement | string;
  showBreadcrumbs?: boolean;
  redactedThemaId?: string | null;
  redactedScope?: ScopeRequested;
  breadcrumbs?: PageBreadcrumbsV2Props['breadcrumbs'];
  showUserFeedback?: boolean;
  userFeedbackDetails?: RecordStr2;
}

const PADDING_TOP = 'large';
const PADDING_BOTTOM = 'x-large';

export function PageV2({
  className,
  heading,
  children,
  showBreadcrumbs = true,
  redactedThemaId,
  redactedScope,
  breadcrumbs,
  showUserFeedback = false,
  userFeedbackDetails,
}: PageProps) {
  return (
    <div
      className={classNames(
        'mams-content-wrapper',
        getRedactedClass(redactedThemaId, redactedScope)
      )}
    >
      {showBreadcrumbs && (
        <Grid id="page-breadcrumbs" paddingTop={PADDING_TOP}>
          <PageContentCell startWide={1} spanWide={12}>
            <PageBreadcrumbsV2 breadcrumbs={breadcrumbs} pageTitle={heading} />
          </PageContentCell>
        </Grid>
      )}
      <main id="page-main-content" className={className}>
        <Grid paddingTop={showBreadcrumbs ? undefined : PADDING_TOP}>
          <PageContentCell startWide={1} spanWide={12}>
            <Heading className="ams-mb-s" level={1}>
              {heading}
            </Heading>
          </PageContentCell>
        </Grid>
        <Grid paddingBottom={PADDING_BOTTOM}>
          {children}
          {showUserFeedback && (
            <InlineKTO userFeedbackDetails={userFeedbackDetails} />
          )}
        </Grid>
      </main>
    </div>
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
