import React, { useMemo } from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import { AppState } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoPanel,
  InfoPanelCollapsible,
  Linkd,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import { formatKvkProfileData } from './formatDataCommercial';
import { ProfileSection } from './formatDataPrivate';
import styles from './Profile.module.scss';
import {
  panelConfigCommercial,
  PanelConfigFormatter,
} from './profilePanelConfig';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  KVK: AppState['KVK']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(KVK);
  }
  return panelConfig;
}

interface InfoPanelMultiProps {
  id: string;
  items: any[];
  KVKData: AppState['KVK'];
  panelConfig: PanelConfigFormatter;
  profileData: ProfileSection;
}

function InfoPanelMulti({
  id,
  items,
  KVKData,
  panelConfig,
  profileData,
}: InfoPanelMultiProps) {
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
  const { KVK } = useAppStateGetter();
  const kvkProfileData = useMemo(() => {
    return KVK.content !== null
      ? formatKvkProfileData(KVK.content)
      : KVK.content;
  }, [KVK]);

  return (
    <DetailPage className={styles.ProfileCommercial}>
      <PageHeading icon={<ChapterIcon />} isLoading={false}>
        Mijn onderneming
      </PageHeading>
      <PageContent className={styles.Intro}>
        <p>
          Hier ziet u hoe uw onderneming ingeschreven staat in het
          Handelsregister van de Kamer van Koophandel. In dat register staan
          onder meer uw bedrijfsnaam, vestigingsadres en KvK-nummer. De gemeente
          gebruikt deze gegevens. Het is dus belangrijk dat uw gegevens kloppen.
        </p>
        <p>
          <Linkd
            href="https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/"
            external={true}
          >
            Geef wijzigingen door aan de Kamer van Koophandel
          </Linkd>
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
        <InfoPanelMulti
          id="kvk-rechtspersonen"
          KVKData={KVK}
          items={KVK.content.rechtspersonen}
          panelConfig={panelConfigCommercial.rechtspersonen}
          profileData={kvkProfileData.rechtspersonen}
        />
      )}

      {kvkProfileData?.hoofdVestiging && (
        <InfoPanel
          className={styles.DefaultPanel}
          {...formatInfoPanelConfig(panelConfigCommercial.hoofdVestiging, KVK)}
          panelData={kvkProfileData.hoofdVestiging}
        />
      )}

      {!!kvkProfileData?.vestigingen?.length && (
        <InfoPanelCollapsible
          id="overige-vestigingen"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfigCommercial.vestigingen, KVK)}
          panelData={kvkProfileData.vestigingen}
        />
      )}

      {!!KVK.content?.aandeelhouders && kvkProfileData?.aandeelhouders && (
        <InfoPanelMulti
          id="kvk-aandeelhouders"
          KVKData={KVK}
          items={KVK.content.aandeelhouders}
          panelConfig={panelConfigCommercial.aandeelhouders}
          profileData={kvkProfileData.aandeelhouders}
        />
      )}

      {!!KVK.content?.bestuurders && kvkProfileData?.bestuurders && (
        <InfoPanelMulti
          id="kvk-bestuurders"
          KVKData={KVK}
          items={KVK.content.bestuurders}
          panelConfig={panelConfigCommercial.bestuurders}
          profileData={kvkProfileData.bestuurders}
        />
      )}
      <PageContent>
        <p className={styles.SuppressedParagraph}>
          Hebt u de afgelopen 14 dagen uw KvK-gegevens gewijzigd? Dan kan het
          zijn dat u die wijziging nog niet ziet in Mijn Amsterdam.
        </p>
        <p className={styles.SuppressedParagraph}>
          U kunt deze gegevens niet gebruiken als uittreksel. Een gewaarmerkt
          uittreksel vraagt u aan bij de de{' '}
          <LinkdInline href="https://kvk.nl" external={true}>
            Kamer van Koophandel
          </LinkdInline>
          .
        </p>
      </PageContent>
    </DetailPage>
  );
}
