import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FocusItem } from '../../../server/services/focus/focus-types';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';

import {
  Alert,
  ChapterIcon,
  DetailPage,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { StatusLineItem } from '../../components/StatusLine/StatusLine';
import styles from './InkomenDetail.module.scss';
import { useAppStateAtom } from '../../hooks/useAppState';

export const MAX_STEP_COUNT_FOCUS_REUEST = 4;

export function altDocumentContent(
  statusLineItem: StatusLineItem,
  stepNumber: number
) {
  if (!!statusLineItem.documents.length) {
    return '';
  }

  if (
    statusLineItem.status === 'Informatie nodig' &&
    statusLineItem.isRecent &&
    !statusLineItem.isActive
  ) {
    return <b>U heeft deze brief per post ontvangen.</b>;
  }

  return ['Informatie nodig', 'Besluit'].includes(statusLineItem.status) ? (
    statusLineItem.isRecent ? (
      <b>
        U ontvangt
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post.
      </b>
    ) : (
      <b>
        U heeft
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post ontvangen.
      </b>
    )
  ) : (
    ''
  );
}

export default () => {
  const { FOCUS_AANVRAGEN } = useAppStateAtom();

  const { id } = useParams();
  const aanvragen = (FOCUS_AANVRAGEN.content || []) as FocusItem[];
  const focusItem = aanvragen.find(item => item.id === id);
  const noContent = !isLoading(FOCUS_AANVRAGEN) && !focusItem;
  const hasDecision =
    focusItem && focusItem.steps.some(step => step.status === 'Besluit');
  let title = 'Onbekend item';

  if (focusItem) {
    title = focusItem.title;
  }

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={isLoading(FOCUS_AANVRAGEN)}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {(isError(FOCUS_AANVRAGEN) || noContent) && (
          <Alert type="warning">
            <p>
              We kunnen op dit moment geen gegevens tonen.{' '}
              <LinkdInline href={AppRoutes.INKOMEN}>
                Naar het overzicht
              </LinkdInline>
            </p>
          </Alert>
        )}
        {isLoading(FOCUS_AANVRAGEN) && <LoadingContent />}
      </PageContent>
      {!!focusItem && !!focusItem.steps && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${focusItem.title}`}
          items={focusItem.steps}
          showToggleMore={true}
          maxStepCount={!hasDecision ? MAX_STEP_COUNT_FOCUS_REUEST : undefined}
          id={id}
        />
      )}
    </DetailPage>
  );
};
