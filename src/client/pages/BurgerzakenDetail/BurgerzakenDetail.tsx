import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  capitalizeFirstLetter,
  isError,
  isLoading,
  defaultDateFormat,
} from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
  InfoDetail,
} from '../../components';
import styles from './BurgerzakenDetail.module.scss';

export default () => {
  const { BRP } = useContext(AppContext);
  const { id } = useParams();

  const DocumentItem = BRP.content?.identiteitsbewijzen?.find(
    item => item.id === id
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
        {isLoading(BRP) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!!DocumentItem && (
          <>
            <InfoDetail
              label="Documentnummer"
              value={DocumentItem.documentNummer}
            />
            <InfoDetail
              label="Datum uitgifte"
              value={defaultDateFormat(DocumentItem.datumUitgifte)}
            />
            <InfoDetail
              label="Geldig tot"
              value={defaultDateFormat(DocumentItem.datumAfloop)}
            />
          </>
        )}
      </PageContent>
    </DetailPage>
  );
};
