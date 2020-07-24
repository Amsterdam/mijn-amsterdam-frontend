import React, { useMemo } from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoPanel,
  LoadingContent,
  PageContent,
  PageHeading,
  InfoPanelCollapsible,
  LinkdInline,
} from '../../components';
import { useAppStateAtom } from '../../hooks/useAppState';
import styles from './Profile.module.scss';
import { AppState } from '../../AppState';
import {
  PanelConfigFormatter,
  panelConfigCommercial,
} from './Profile.constants';
import { formatKvkProfileData } from './formatDataCommercial';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  KVK: AppState['KVK']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(KVK);
  }
  return panelConfig;
}

export default function ProfileCommercial() {
  const { KVK } = useAppStateAtom();

  const kvkProfileData = useMemo(() => {
    return KVK.content ? formatKvkProfileData(KVK.content) : KVK.content;
  }, [KVK]);

  return (
    <DetailPage className={styles.ProfileCommercial}>
      <PageHeading icon={<ChapterIcon />} isLoading={isLoading(KVK)}>
        Mijn onderneming
      </PageHeading>
      <PageContent className={styles.Intro}>
        <p>
          In het Handelsregister worden uw bedrijfs gegevens vastgelegd. Het
          gaat hier bijvoorbeeld om uw bedrijfsnaam, vestigingsadres en Kamer
          van Koophandel nummer. De gemeente gebruikt deze gegevens. Belangrijk
          dus dat deze gegevens kloppen.
        </p>
        <p>
          Kloppen uw gegevens niet of wilt u iets wijzigen geeft dit dan door
          aan de{' '}
          <LinkdInline href="https://kvk.nl" external={true}>
            kamer van koophandel
          </LinkdInline>
          .
        </p>

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

      {!!kvkProfileData?.onderneming && (
        <InfoPanel
          className={styles.DefaultPanel}
          {...formatInfoPanelConfig(panelConfigCommercial.onderneming, KVK)}
          panelData={kvkProfileData.onderneming}
        />
      )}

      {!!kvkProfileData?.rechtspersonen && (
        <InfoPanelCollapsible
          id="profile-commercial-rechtspersonen"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfigCommercial.rechtspersonen, KVK)}
          panelData={kvkProfileData.rechtspersonen}
        />
      )}

      {!!kvkProfileData?.vestigingen && (
        <InfoPanelCollapsible
          id="profile-commercial-vestigingen"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfigCommercial.vestigingen, KVK)}
          panelData={kvkProfileData.vestigingen}
        />
      )}

      {!!kvkProfileData?.aandeelhouders && (
        <InfoPanelCollapsible
          id="profile-commercial-aandeelhouders"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfigCommercial.aandeelhouders, KVK)}
          panelData={kvkProfileData.aandeelhouders}
        />
      )}

      {!!kvkProfileData?.bestuurders && (
        <InfoPanelCollapsible
          id="profile-commercial-bestuurders"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfigCommercial.bestuurders, KVK)}
          panelData={kvkProfileData.bestuurders}
        />
      )}
    </DetailPage>
  );
}
