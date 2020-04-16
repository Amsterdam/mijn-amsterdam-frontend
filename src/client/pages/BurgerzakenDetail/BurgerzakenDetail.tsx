import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  capitalizeFirstLetter,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import styles from './BurgerzakenDetail.module.scss';
import { ReisDocument } from '../../../server/services/brp';

export default () => {
  const { BRP } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const DocumentItem = BRP.content?.reisDocumenten?.find(
    (item: ReisDocument) => item.documentNummer === id
  );

  const noContent = !isLoading(BRP) && !DocumentItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.BURGERZAKEN,
          title: ChapterTitles.BURGERZAKEN,
        }}
        isLoading={isLoading(BRP)}
      >
        {capitalizeFirstLetter(DocumentItem?.title || 'Document')}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(BRP) || noContent) && (
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
              Geldig tot <strong>{DocumentItem.datumAfloop}</strong>
            </p>
          </div>
        )}
      </PageContent>
    </DetailPage>
  );
};
