import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { AdresInOnderzoek } from './AdresInOnderzoek';
import { ContactMomenten } from './ContactMomenten';
import styles from './Profile.module.scss';
import { PanelConfigFormatter, panelConfig } from './profilePanelConfig';
import { useProfileData } from './useProfileData.hook';
import { useProfileThemaData } from './useProfileThemaData.hook';
import { VertrokkenOnbekendWaarheen } from './VertrokkenOnbekendWaarheen';
import {
  hasDutchAndOtherNationalities,
  isMokum,
} from '../../../universal/helpers/brp';
import { AppState } from '../../../universal/types/App.types';
import { InfoPanel, InfoPanelCollapsible, PageContent } from '../../components';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  BRP: AppState['BRP']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(BRP);
  }
  return panelConfig;
}

function BrpProfilePanels() {
  const { BRP, profileData } = useProfileData();
  return (
    <>
      {!!profileData?.persoon && (
        <InfoPanel
          className={styles.DefaultPanel}
          {...formatInfoPanelConfig(panelConfig.persoon, BRP)}
          panelData={profileData.persoon}
        />
      )}
      {!!profileData?.adres && (
        <InfoPanel
          className={classnames(styles.DefaultPanel, styles.AddressPanel)}
          {...formatInfoPanelConfig(panelConfig.adres, BRP)}
          panelData={profileData.adres}
        />
      )}
      {!!profileData?.verbintenis && (
        <InfoPanelCollapsible
          id="profile-verbintenis"
          className={classnames(styles.Verbintenis, styles.CollapsiblePanel)}
          {...formatInfoPanelConfig(panelConfig.verbintenis, BRP)}
          panelData={profileData.verbintenis}
        />
      )}
      {!!profileData?.verbintenisHistorisch &&
        profileData?.verbintenisHistorisch.length && (
          <InfoPanelCollapsible
            id="profile-verbintenisHistorisch"
            className={classnames(styles.Verbintenis, styles.CollapsiblePanel)}
            {...formatInfoPanelConfig(panelConfig.verbintenisHistorisch, BRP)}
            panelData={profileData.verbintenisHistorisch}
          />
        )}
      {!!profileData?.kinderen && profileData.kinderen.length && (
        <InfoPanelCollapsible
          id="profile-kinderen"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfig.kinderen, BRP)}
          panelData={profileData.kinderen}
        />
      )}
      {!!profileData?.ouders && profileData.ouders.length && (
        <InfoPanelCollapsible
          id="profile-ouders"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfig.ouders, BRP)}
          panelData={profileData.ouders}
        />
      )}
      {!!profileData?.adresHistorisch &&
        profileData?.adresHistorisch.length && (
          <InfoPanelCollapsible
            id="profile-adresHistorisch"
            className={styles.CollapsiblePanel}
            {...formatInfoPanelConfig(panelConfig.adresHistorisch, BRP)}
            panelData={profileData.adresHistorisch}
          />
        )}
      {isMokum(BRP.content) && (
        <PageContent>
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
        </PageContent>
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
          <Grid.Cell span="all">
            <BrpProfilePanels />
          </Grid.Cell>
        </>
      }
    />
  );
}
