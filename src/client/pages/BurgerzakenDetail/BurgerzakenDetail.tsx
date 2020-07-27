import React from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  capitalizeFirstLetter,
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import styles from './BurgerzakenDetail.module.scss';
import { useAppStateGetter } from '../../hooks/useAppState';

export default () => {
  const { BRP } = useAppStateGetter();
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
