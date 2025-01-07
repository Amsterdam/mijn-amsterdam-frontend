import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';

import { AdresInOnderzoek } from './AdresInOnderzoek';
import { ContactMomenten } from './ContactMomenten';
import styles from './Profile.module.scss';
import { panelConfig } from './profilePanelConfig';
import {
  formatInfoPanelConfig,
  ProfileSectionPanel,
} from './ProfileSectionPanel';
import { useProfileData } from './useProfileData.hook';
import { useProfileThemaData } from './useProfileThemaData.hook';
import { VertrokkenOnbekendWaarheen } from './VertrokkenOnbekendWaarheen';
import {
  hasDutchAndOtherNationalities,
  isMokum,
} from '../../../universal/helpers/brp';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';

function ProfilePrivateSectionPanels() {
  const { BRP, profileData } = useProfileData();

  return (
    <>
      {!!profileData?.persoon && (
        <ProfileSectionPanel
          sectionData={profileData.persoon}
          startCollapsed={false}
          {...formatInfoPanelConfig(panelConfig.persoon, BRP)}
        />
      )}
      {!!profileData?.adres && (
        <ProfileSectionPanel
          sectionData={profileData.adres}
          startCollapsed={false}
          {...formatInfoPanelConfig(panelConfig.adres, BRP)}
        />
      )}
      {!!profileData?.verbintenis && (
        <ProfileSectionPanel
          sectionData={profileData.verbintenis}
          {...formatInfoPanelConfig(panelConfig.verbintenis, BRP)}
        />
      )}
      {!!profileData?.verbintenisHistorisch?.length && (
        <ProfileSectionPanel
          sectionData={profileData.verbintenisHistorisch}
          {...formatInfoPanelConfig(panelConfig.verbintenisHistorisch, BRP)}
        />
      )}
      {!!profileData?.kinderen?.length && (
        <ProfileSectionPanel
          sectionData={profileData.kinderen}
          {...formatInfoPanelConfig(panelConfig.kinderen, BRP)}
        />
      )}
      {!!profileData?.ouders?.length && (
        <ProfileSectionPanel
          sectionData={profileData.ouders}
          {...formatInfoPanelConfig(panelConfig.ouders, BRP)}
        />
      )}
      {!!profileData?.adresHistorisch?.length && (
        <ProfileSectionPanel
          sectionData={profileData.adresHistorisch}
          {...formatInfoPanelConfig(panelConfig.adresHistorisch, BRP)}
        />
      )}
      {isMokum(BRP.content) && (
        <Grid.Cell span="all">
          <p className={styles.SuppressedParagraph}>
            Het is helaas niet mogelijk om de gegevens van een levenloos geboren
            kindje te tonen in Mijn Amsterdam. U kunt deze gegevens wel inzien
            in{' '}
            <Link href="https://mijn.overheid.nl" rel="noopener noreferrer">
              MijnOverheid
            </Link>
            .
          </p>
          <p className={styles.SuppressedParagraph}>
            Op deze pagina laten wij uw gegevens zien uit de landelijke en
            Amsterdamse administratie. Gegevens die bij een andere gemeente zijn
            geregistreerd worden hier niet getoond.
          </p>
        </Grid.Cell>
      )}
    </>
  );
}

export function MijnGegevensThema() {
  const {
    brpContent,
    isLoadingBrp,
    isLoadingContactmomenten,
    isErrorBrp,
    isErrorContactmomenten,
    linkListItems,
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
  const isThemaPaginaLoading = isLoadingBrp && isLoadingContactmomenten;

  const pageContentTop = (
    <Grid.Cell span="all">
      <Paragraph className="ams-mb--sm">
        In de Basisregistratie Personen legt de gemeente persoonsgegevens over u
        vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of uw
        burgerlijke staat. De gemeente gebruikt deze gegevens. Belangrijk dus
        dat deze gegevens kloppen.
      </Paragraph>
      {!isLoadingBrp && !isMokum(brpContent) && (
        <Paragraph className="ams-mb--sm">
          U staat niet ingeschreven in Amsterdam. Daarom ziet u alleen gegevens
          die de gemeente Amsterdam van u heeft.
        </Paragraph>
      )}
      {hasDutchAndOtherNationalities(brpContent) && (
        <Paragraph>
          Als u een andere nationaliteit hebt of hebt gehad naast de
          Nederlandse, dan ziet u alleen uw Nederlandse nationaliteit. U ziet
          alleen uw buitenlandse nationaliteit of nationaliteiten als u op dit
          moment geen Nederlandse nationaliteit hebt.
        </Paragraph>
      )}
    </Grid.Cell>
  );

  return (
    <ThemaPagina
      title={ThemaTitles.BRP}
      isError={isThemaPaginaError}
      isPartialError={isErrorBrp || isErrorContactmomenten}
      errorAlertContent={pageContentErrorAlert}
      isLoading={!isThemaPaginaError && isThemaPaginaLoading}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          <Grid.Cell span="all">
            {brpContent?.persoon.vertrokkenOnbekendWaarheen && (
              <VertrokkenOnbekendWaarheen brpContent={brpContent} />
            )}
            {brpContent?.persoon?.adresInOnderzoek && (
              <AdresInOnderzoek brpContent={brpContent} />
            )}
          </Grid.Cell>
          <Grid.Cell span="all">
            <ContactMomenten />
          </Grid.Cell>
          <ProfilePrivateSectionPanels />
        </>
      }
    />
  );
}
