import { Link, Paragraph } from '@amsterdam/design-system-react';

import { AdresInOnderzoek } from './AdresInOnderzoek.tsx';
import { ContactMomenten } from './ContactMomenten.tsx';
import { panelConfig } from './ProfilePrivate.transform.tsx';
import { ProfileSectionPanel } from '../ProfileSectionPanel.tsx';
import { useProfileData } from './useProfileData.hook.tsx';
import { useProfileThemaData } from './useProfileThemaData.hook.tsx';
import { VertrokkenOnbekendWaarheen } from './VertrokkenOnbekendWaarheen.tsx';
import {
  hasDutchAndOtherNationalities,
  isMokum,
} from '../../../../../universal/helpers/brp.ts';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ParagaphSuppressed } from '../../../../components/ParagraphSuppressed/ParagraphSuppressed.tsx';
import ThemaPagina from '../../../../components/Thema/ThemaPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';

function ProfilePrivateSectionPanels() {
  const { BRP, profileData, routeConfig } = useProfileData();

  useHTMLDocumentTitle(routeConfig.themaPageBRP);

  return (
    <>
      {!!profileData?.persoon && (
        <ProfileSectionPanel
          sectionData={profileData.persoon}
          startCollapsed={false}
          {...panelConfig.persoon(BRP)}
        />
      )}
      {!!profileData?.adres && (
        <ProfileSectionPanel
          sectionData={profileData.adres}
          startCollapsed={false}
          {...panelConfig.adres(BRP)}
        />
      )}
      {!!profileData?.verbintenis && (
        <ProfileSectionPanel
          sectionData={profileData.verbintenis}
          {...panelConfig.verbintenis(BRP)}
        />
      )}
      {!!profileData?.verbintenisHistorisch?.length && (
        <ProfileSectionPanel
          sectionData={profileData.verbintenisHistorisch}
          {...panelConfig.verbintenisHistorisch(BRP)}
        />
      )}
      {!!profileData?.kinderen?.length && (
        <ProfileSectionPanel
          sectionData={profileData.kinderen}
          {...panelConfig.kinderen(BRP)}
        />
      )}
      {!!profileData?.ouders?.length && (
        <ProfileSectionPanel
          sectionData={profileData.ouders}
          {...panelConfig.ouders(BRP)}
        />
      )}
      {!!profileData?.adresHistorisch?.length && (
        <ProfileSectionPanel
          sectionData={profileData.adresHistorisch}
          {...panelConfig.adresHistorisch(BRP)}
        />
      )}
      {isMokum(BRP.content) && (
        <PageContentCell>
          <ParagaphSuppressed className="ams-mb-m">
            Het is helaas niet mogelijk om de gegevens van een levenloos geboren
            kindje te tonen in Mijn Amsterdam. U kunt deze gegevens wel inzien
            in{' '}
            <Link href="https://mijn.overheid.nl" rel="noopener noreferrer">
              MijnOverheid
            </Link>
            .
          </ParagaphSuppressed>
          <ParagaphSuppressed>
            Op deze pagina laten wij uw gegevens zien uit de landelijke en
            Amsterdamse administratie. Gegevens die bij een andere gemeente zijn
            geregistreerd worden hier niet getoond.
          </ParagaphSuppressed>
        </PageContentCell>
      )}
    </>
  );
}

export function MijnGegevensThema() {
  const {
    title,
    brpContent,
    isLoadingBrp,
    isLoadingContactmomenten,
    isErrorBrp,
    isErrorContactmomenten,
    linkListItems,
    hasContactMomenten,
  } = useProfileThemaData();

  const pageContentErrorAlert = (
    <>
      Wij kunnen de volgende gegevens nu niet tonen:
      <br />
      {isErrorBrp && <>- Uw persoonlijke gegevens</>}
      {isErrorContactmomenten && <>- Uw overzicht van contactmomenten</>}
    </>
  );
  const isThemaPaginaError = isErrorBrp && isErrorContactmomenten;
  const isThemaPaginaLoading = isLoadingBrp || isLoadingContactmomenten;
  const nonMokum = !isLoadingBrp && !isMokum(brpContent);
  const hasOtherNationality = hasDutchAndOtherNationalities(brpContent);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className={hasOtherNationality || nonMokum ? 'ams-mb-m' : ''}>
        In de Basisregistratie Personen legt de gemeente persoonsgegevens over u
        vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of uw
        burgerlijke staat. De gemeente gebruikt deze gegevens. Belangrijk dus
        dat deze gegevens kloppen.
      </Paragraph>
      {nonMokum && (
        <Paragraph className={hasOtherNationality ? 'ams-mb-m' : ''}>
          U staat niet ingeschreven in Amsterdam. Daarom ziet u alleen gegevens
          die de gemeente Amsterdam van u heeft.
        </Paragraph>
      )}
      {hasOtherNationality && (
        <Paragraph>
          Als u een andere nationaliteit hebt of hebt gehad naast de
          Nederlandse, dan ziet u alleen uw Nederlandse nationaliteit. U ziet
          alleen uw buitenlandse nationaliteit of nationaliteiten als u op dit
          moment geen Nederlandse nationaliteit hebt.
        </Paragraph>
      )}
    </PageContentCell>
  );

  return (
    <ThemaPagina
      title={title}
      isError={isThemaPaginaError}
      isPartialError={isErrorBrp || isErrorContactmomenten}
      errorAlertContent={pageContentErrorAlert}
      isLoading={!isThemaPaginaError && isThemaPaginaLoading}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          {brpContent?.persoon?.vertrokkenOnbekendWaarheen && (
            <PageContentCell>
              <VertrokkenOnbekendWaarheen brpContent={brpContent} />
            </PageContentCell>
          )}
          {brpContent?.persoon?.adresInOnderzoek && (
            <PageContentCell>
              <AdresInOnderzoek brpContent={brpContent} />
            </PageContentCell>
          )}
          {hasContactMomenten && (
            <PageContentCell>
              <ContactMomenten />
            </PageContentCell>
          )}
          <ProfilePrivateSectionPanels />
        </>
      }
    />
  );
}
