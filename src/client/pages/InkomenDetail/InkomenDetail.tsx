import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { StatusLineItem } from '../../components/StatusLine/StatusLine';
import styles from './InkomenDetail.module.scss';

export const MAX_STEP_COUNT_FOCUS_REUEST = 4;

export function altDocumentContent(
  statusLineItem: StatusLineItem,
  stepNumber: number
) {
  if (!!statusLineItem.documents.length) {
    return '';
  }

  if (
    statusLineItem.status === 'Meer informatie nodig' &&
    statusLineItem.isRecent &&
    !statusLineItem.isLastActive
  ) {
    return <b>U heeft deze brief per post ontvangen.</b>;
  }

  return ['Meer informatie nodig', 'Besluit'].includes(
    statusLineItem.status
  ) ? (
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
  const { FOCUS_AANVRAGEN } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const FocusItem = FOCUS_AANVRAGEN.content?.find(item => item.id === id);
  const noContent = !isLoading(FOCUS_AANVRAGEN) && !FocusItem;
  const hasDecision =
    FocusItem && FocusItem.steps.some(step => step.title === 'beslissing');
  let title = 'Onbekend item';

  if (FocusItem) {
    title = FocusItem.title;
  }

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {(isError(FOCUS_AANVRAGEN) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(FOCUS_AANVRAGEN) && <LoadingContent />}
      </PageContent>
      {!!FocusItem && !!FocusItem.steps && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${FocusItem.title}`}
          items={FocusItem.steps}
          maxStepCount={!hasDecision ? MAX_STEP_COUNT_FOCUS_REUEST : undefined}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
    </DetailPage>
  );
};
