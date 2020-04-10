import React, { useContext } from 'react';
import { DetailPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './BurgerzakenDetail.module.scss';
import { ChapterTitles } from 'config/Chapter.constants';
import { AppRoutes } from 'config/Routing.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default () => {
  const {
    BRP: { data, isError, isLoading },
  } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const DocumentItem = data.reisDocumenten?.find(
    item => item.documentNummer === id
  );
  const noContent = !isLoading && !DocumentItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.BURGERZAKEN,
          title: ChapterTitles.BURGERZAKEN,
        }}
        isLoading={isLoading}
      >
        {DocumentItem?.title}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading && <LoadingContent className={styles.LoadingContentInfo} />}
        {!!DocumentItem && (
          <div className={styles.DocumentProperties}>
            <p>
              Documentnummer <strong>{DocumentItem.documentNummer}</strong>
            </p>
            <p>
              Datum uitgifte <strong>{DocumentItem.datumUitgifte}</strong>
            </p>
            <p>
              Datum afloop <strong>{DocumentItem.datumAfloop}</strong>
            </p>
          </div>
        )}
      </PageContent>
    </DetailPage>
  );
};
