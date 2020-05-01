import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
  Linkd,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import styles from './InkomenDetail.module.scss';
import useRouter from 'use-react-router';
import { ExternalUrls } from '../../config/App.constants';
import { StatusLineItem } from '../../components/StatusLine/StatusLine';

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

  const FocusItem = FOCUS_AANVRAGEN.content.find(item => item.id === id);
  const noContent = !isLoading && !FocusItem;

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
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(FOCUS_AANVRAGEN) && <LoadingContent />}
      </PageContent>
      {!!FocusItem && !!FocusItem.process && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${FocusItem.title}`}
          items={FocusItem.process}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
    </DetailPage>
  );
};
