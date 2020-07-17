import React from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoPanel,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateAtom } from '../../hooks/useAppState';
import styles from './Profile.module.scss';

export default function ProfileCommercial() {
  const { KVK } = useAppStateAtom();

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
