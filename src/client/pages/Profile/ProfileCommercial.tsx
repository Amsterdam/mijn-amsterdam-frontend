import React, { useContext } from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoPanel,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import styles from './Profile.module.scss';

export default function ProfileCommercial() {
  const { KVK } = useContext(AppContext);

  return (
    <DetailPage className={styles.Profile}>
      <PageHeading icon={<ChapterIcon />} isLoading={isLoading(KVK)}>
        Gegevens handelsregister
      </PageHeading>
      <PageContent className={styles.Intro}>
        <p>Lorum ipsum dolimit et cetera</p>

        {isLoading(KVK) && (
          <div className={styles.LoadingContent}>
            <LoadingContent />
            <LoadingContent />
            <LoadingContent />
          </div>
        )}

        {isError(KVK) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>

      {!!KVK.content?.name && (
        <InfoPanel className={styles.DefaultPanel} panelData={KVK.content} />
      )}
    </DetailPage>
  );
}
