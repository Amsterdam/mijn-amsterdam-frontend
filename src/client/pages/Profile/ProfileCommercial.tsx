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
import { ProfileSection } from './formatData';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  KVK: AppState['KVK']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(KVK);
  }
  return panelConfig;
}

interface InfoPanelContentProps {
  id: string;
  items: any[];
  KVKData: AppState['KVK'];
  panelConfig: PanelConfigFormatter;
  profileData: ProfileSection;
}

function InfoPanelContent({
  id,
  items,
  KVKData,
  panelConfig,
  profileData,
}: InfoPanelContentProps) {
  if (!items?.length) {
    return null;
  }
  return items.length > 1 ? (
    <InfoPanelCollapsible
      id={id}
      className={styles.CollapsiblePanel}
      {...formatInfoPanelConfig(panelConfig, KVKData)}
      panelData={profileData}
    />
  ) : (
    <InfoPanel
      className={styles.DefaultPanel}
      {...formatInfoPanelConfig(panelConfig, KVKData)}
      panelData={profileData}
    />
  );
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

      {!!KVK.content?.rechtspersonen && kvkProfileData?.rechtspersonen && (
        <InfoPanelContent
          id="kvk-rechtspersonen"
          KVKData={KVK}
          items={KVK.content.rechtspersonen}
          panelConfig={panelConfigCommercial.rechtspersonen}
          profileData={kvkProfileData.rechtspersonen}
        />
      )}

      {!!KVK.content?.vestigingen && kvkProfileData?.vestigingen && (
        <InfoPanelContent
          id="kvk-vestigingen"
          KVKData={KVK}
          items={KVK.content.vestigingen}
          panelConfig={panelConfigCommercial.vestigingen}
          profileData={kvkProfileData.vestigingen}
        />
      )}

      {!!KVK.content?.aandeelhouders && kvkProfileData?.aandeelhouders && (
        <InfoPanelContent
          id="kvk-aandeelhouders"
          KVKData={KVK}
          items={KVK.content.aandeelhouders}
          panelConfig={panelConfigCommercial.aandeelhouders}
          profileData={kvkProfileData.aandeelhouders}
        />
      )}

      {!!KVK.content?.bestuurders && kvkProfileData?.bestuurders && (
        <InfoPanelContent
          id="kvk-bestuurders"
          KVKData={KVK}
          items={KVK.content.bestuurders}
          panelConfig={panelConfigCommercial.bestuurders}
          profileData={kvkProfileData.bestuurders}
        />
      )}
    </DetailPage>
  );
}
