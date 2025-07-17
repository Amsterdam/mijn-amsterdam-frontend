import { Link, Paragraph } from '@amsterdam/design-system-react';

import { panelConfig } from './ProfileCommercial.transform';
import { useProfileData } from './useProfileData.hook';
import { PageContentCell } from '../../../../components/Page/Page';
import { ParagaphSuppressed } from '../../../../components/ParagraphSuppressed/ParagraphSuppressed';
import ThemaPagina from '../../../../components/Thema/ThemaPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { ProfileSectionPanel } from '../ProfileSectionPanel';

function ProfileCommercialSectionPanels() {
  const { KVK, profileData, routeConfig } = useProfileData();
  useHTMLDocumentTitle(routeConfig.themaPageKVK);

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
      <PageContentCell spanWide={8}>
        <ParagaphSuppressed className="ams-mb-m">
          Heeft u de afgelopen 14 dagen uw KvK-gegevens gewijzigd? Dan kan het
          zijn dat u die wijziging nog niet ziet in Mijn Amsterdam.
        </ParagaphSuppressed>
        <ParagaphSuppressed>
          U kunt deze gegevens niet gebruiken als uittreksel. Een gewaarmerkt
          uittreksel vraagt u aan bij de de{' '}
          <Link href="https://kvk.nl" rel="noopener noreferrer">
            Kamer van Koophandel
          </Link>
          .
        </ParagaphSuppressed>
      </PageContentCell>
    </>
  );
}

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hier ziet u hoe uw onderneming ingeschreven staat in het Handelsregister
      van de Kamer van Koophandel. In dat register staan onder meer uw
      bedrijfsnaam, vestigingsadres en KvK-nummer. De gemeente gebruikt deze
      gegevens. Het is dus belangrijk dat uw gegevens kloppen.
    </Paragraph>
  </PageContentCell>
);

export function MijnBedrijfsGegevensThema() {
  const { isLoading, isError, linkListItems, title } = useProfileData();

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
