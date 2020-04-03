import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import React, { useContext } from 'react';
import {
  StatusLineItem,
  StepType,
} from '../../components/StatusLine/StatusLine';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import styles from './InkomenDetail.module.scss';
import useRouter from 'use-react-router';

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
        U ontvangt $
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post.
      </b>
    ) : (
      <b>
        U heeft $
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post ontvangen.
      </b>
    )
  ) : (
    ''
  );
}

export default () => {
  const { FOCUS } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const FocusItem = FOCUS?.aanvragen.find(item => item.id === id);
  const noContent = !isLoading(FOCUS?.aanvragen) && !FocusItem;
  const lineItemsTotal = FocusItem?.process.length || 0;
  const items =
    FocusItem?.process.map((item, index) => {
      const stepType: StepType =
        index === lineItemsTotal
          ? 'last-step'
          : index === 0
          ? 'first-step'
          : 'intermediate-step';
      return Object.assign(item, { stepType });
    }) || [];

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {FocusItem && FocusItem.title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {(isError(FOCUS?.aanvragen) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading && <LoadingContent />}
      </PageContent>
      {!!FocusItem && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${FocusItem.productTitle}`}
          items={items}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
    </DetailPage>
  );
};
