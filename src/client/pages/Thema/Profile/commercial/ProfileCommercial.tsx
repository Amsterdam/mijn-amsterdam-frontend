import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';

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
          {...panelConfig.onderneming(KVK, profileData)}
        />
      )}

      {!!profileData?.eigenaar && (
        <ProfileSectionPanel
          sectionData={profileData.eigenaar}
          startCollapsed={false}
          {...panelConfig.eigenaar(KVK, profileData)}
        />
      )}

      {profileData?.hoofdVestiging && (
        <ProfileSectionPanel
          sectionData={profileData.hoofdVestiging}
          {...panelConfig.hoofdVestiging(KVK, profileData)}
        />
      )}

      {!!profileData?.vestigingen?.length && KVK.content?.vestigingen && (
        <ProfileSectionPanel
          sectionData={profileData.vestigingen}
          {...panelConfig.vestigingen(KVK, profileData)}
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

function CommercialPageContentTop({
  kvkTranslation,
}: {
  kvkTranslation?: { from: string; to: string };
}) {
  return (
    <>
      <PageContentCell spanWide={8}>
        <Paragraph className="ams-mb-m">
          Hier ziet u hoe uw onderneming ingeschreven staat in het
          Handelsregister van de Kamer van Koophandel.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          De gemeente gebuikt deze gegevens. Het is daarom belangrijk dat uw
          gegevens kloppen.{' '}
        </Paragraph>
        <Paragraph>
          Mijn Amsterdam toont alleen vestigingen met een adres in een van de
          volgende 10 gemeentes: Amsterdam, Aalsmeer, Amstelveen, Diemen,
          Haarlemmermeer, Landsmeer, Oostzaan, Ouder-Amstel, Uithoorn en
          Zaanstad.
        </Paragraph>
      </PageContentCell>
      {kvkTranslation && (
        <PageContentCell>
          <Alert heading="Let op! KvK vertaald" headingLevel={1}>
            <Paragraph>
              Het EHerkenning test account KvKnummer is vertaald van{' '}
              {kvkTranslation.from} naar {kvkTranslation.to}.
            </Paragraph>
            <Paragraph>
              Dit betekent dat de bedrijfsgegevens, locatiegegevens op de kaart
              en andere informatie mogelijk niet overeenkomen met de gegevens
              gekoppeld aan het KvKnummer ({kvkTranslation.from}) in de
              bronsystemen.
            </Paragraph>
          </Alert>
        </PageContentCell>
      )}
    </>
  );
}
export function MijnBedrijfsGegevensThema() {
  const { isLoading, isError, linkListItems, id, title, KVK } =
    useProfileData();

  return (
    <ThemaPagina
      id={id}
      title={title}
      isError={isError && !isLoading}
      isLoading={isLoading && !isError}
      linkListItems={linkListItems}
      pageContentTop={
        <CommercialPageContentTop
          kvkTranslation={KVK?.content?.kvkTranslation}
        />
      }
      pageContentMain={<ProfileCommercialSectionPanels />}
      maintenanceNotificationsPageSlug="kvk"
    />
  );
}
