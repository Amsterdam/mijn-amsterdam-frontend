import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';

import { panelConfig } from './ProfileCommercial.transform';
import { useProfileData } from './useProfileData.hook';
import { ProfileSectionPanel } from '../ProfileSectionPanel';
import styles from './ProfileCommercial.module.scss';
import ThemaPagina from '../../ThemaPagina/ThemaPagina';

function ProfileCommercialSectionPanels() {
  const { KVK, profileData } = useProfileData();

  if (!profileData) {
    return null;
  }

  return (
    <>
      {!!profileData?.onderneming && (
        <ProfileSectionPanel
          sectionData={profileData.onderneming}
          startCollapsed={false}
          {...panelConfig.onderneming(KVK)}
        />
      )}

      {!!KVK.content?.rechtspersonen && profileData?.rechtspersonen && (
        <ProfileSectionPanel
          sectionData={profileData.rechtspersonen}
          startCollapsed={false}
          {...panelConfig.rechtspersonen(KVK)}
        />
      )}

      {!!profileData?.eigenaar && (
        <ProfileSectionPanel
          sectionData={profileData.eigenaar}
          startCollapsed={!!KVK.content?.rechtspersonen?.length}
          {...panelConfig.eigenaar(KVK)}
        />
      )}

      {profileData?.hoofdVestiging && (
        <ProfileSectionPanel
          sectionData={profileData.hoofdVestiging}
          {...panelConfig.hoofdVestiging(KVK)}
        />
      )}

      {!!profileData?.vestigingen?.length && KVK.content?.vestigingen && (
        <ProfileSectionPanel
          sectionData={profileData.vestigingen}
          {...panelConfig.vestigingen(KVK)}
        />
      )}

      {!!KVK.content?.aandeelhouders && profileData?.aandeelhouders && (
        <ProfileSectionPanel
          sectionData={profileData.aandeelhouders}
          {...panelConfig.aandeelhouders(KVK)}
        />
      )}

      {!!KVK.content?.gemachtigden && profileData?.gemachtigden && (
        <ProfileSectionPanel
          sectionData={profileData.gemachtigden}
          {...panelConfig.gemachtigden(KVK)}
        />
      )}

      {!!KVK.content?.bestuurders && profileData?.bestuurders && (
        <ProfileSectionPanel
          sectionData={profileData.bestuurders}
          {...panelConfig.bestuurders(KVK)}
        />
      )}
      {!!KVK.content?.aansprakelijken && profileData?.aansprakelijken && (
        <ProfileSectionPanel
          sectionData={profileData.aansprakelijken}
          {...panelConfig.aansprakelijken(KVK)}
        />
      )}
      {!!KVK.content?.overigeFunctionarissen &&
        profileData?.overigeFunctionarissen && (
          <ProfileSectionPanel
            sectionData={profileData.overigeFunctionarissen}
            {...panelConfig.overigeFunctionarissen(KVK)}
          />
        )}
      <Grid.Cell span="all">
        <p className={styles.SuppressedParagraph}>
          Hebt u de afgelopen 14 dagen uw KvK-gegevens gewijzigd? Dan kan het
          zijn dat u die wijziging nog niet ziet in Mijn Amsterdam.
        </p>
        <p className={styles.SuppressedParagraph}>
          U kunt deze gegevens niet gebruiken als uittreksel. Een gewaarmerkt
          uittreksel vraagt u aan bij de de{' '}
          <Link href="https://kvk.nl" rel="noopener noreferrer">
            Kamer van Koophandel
          </Link>
          .
        </p>
      </Grid.Cell>
    </>
  );
}

export function MijnBedrijfsGegevensThema() {
  const { isLoading, isError, linkListItems, title } = useProfileData();

  const pageContentTop = (
    <Grid.Cell span="all">
      <Paragraph>
        Hier ziet u hoe uw onderneming ingeschreven staat in het Handelsregister
        van de Kamer van Koophandel. In dat register staan onder meer uw
        bedrijfsnaam, vestigingsadres en KvK-nummer. De gemeente gebruikt deze
        gegevens. Het is dus belangrijk dat uw gegevens kloppen.
      </Paragraph>
    </Grid.Cell>
  );

  return (
    <ThemaPagina
      title={title}
      isError={isError}
      isLoading={!isLoading && isError}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={<ProfileCommercialSectionPanels />}
    />
  );
}
