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

import { AppContext } from '../../AppState';
import { altDocumentContent } from '../../data-formatting/focus';
import styles from './InkomenDetail.module.scss';
import useRouter from 'use-react-router';

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const FocusItem = items.find(item => item.id === id);
  const noContent = !isLoading && !FocusItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {FocusItem && FocusItem.title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading && <LoadingContent />}
      </PageContent>
      {!!FocusItem && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${FocusItem.productTitle}`}
          items={FocusItem.process}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
    </DetailPage>
  );
};
