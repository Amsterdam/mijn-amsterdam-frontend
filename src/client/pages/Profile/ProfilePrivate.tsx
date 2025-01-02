import { useEffect, useMemo } from 'react';

import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import {
  contactMoment,
  format,
  formatBrpProfileData,
} from './formatDataPrivate';
import styles from './Profile.module.scss';
import { PanelConfigFormatter, panelConfig } from './profilePanelConfig';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import {
  ApiResponse,
  apiPristineResult,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import {
  hasDutchAndOtherNationalities,
  isMokum,
} from '../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { ContactMoment } from '../../../universal/types';
import { AppState } from '../../../universal/types/App.types';
import {
  DetailPage,
  ErrorAlert,
  InfoPanel,
  InfoPanelCollapsible,
  LinkdInline,
  LoadingContent,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  SectionCollapsible,
  ThemaIcon,
} from '../../components';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { useDataApi } from '../../hooks/api/useDataApi';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  BRP: AppState['BRP']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(BRP);
  }
  return panelConfig;
}

const contactmomentenDisplayProps: DisplayProps<ContactMoment> = {
  kanaal: 'Contactvorm',
  onderwerp: 'Onderwerp',
  plaatsgevondenOp: 'Datum',
  nummer: 'Referentie nummer',
};

export default function Profile() {
  const { BRP, SALESFORCE } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();

  const [{ data: residentData }, fetchResidentCount] = useDataApi<
    ApiResponse<{ residentCount: number }>
  >(
    {
      url: BRP.content?.fetchUrlAantalBewoners ?? '',
      postpone: true,
    },
    apiPristineResult({ residentCount: -1 })
  );

  const residentCount = residentData?.content?.residentCount;

  const erfpachtV1ORV2 = FeatureToggle.erfpachtV2Active
    ? 'ERFPACHTv2'
    : 'ERFPACHT';

  const SVWIv1ORv2 = FeatureToggle.svwiLinkActive ? 'SVWI' : 'INKOMEN';

  const mapperContactmomentToMenuItem: { [key: string]: string } = {
    ['Erfpacht']: erfpachtV1ORV2,
    ['Parkeren']: 'PARKEREN',
    ['Zorg']: 'WMO',
    ['Werk en Inkomen']: SVWIv1ORv2,
    ['Belastingen']: 'BELASTINGEN',
    ['Geldzaken']: 'KREFIA',
    ['Financieen']: 'AFIS',
  };

  function getLinkToThemaPage(contactMoment: ContactMoment) {
    const menuItem = myThemasMenuItems.find(
      (item) =>
        item.id ===
        mapperContactmomentToMenuItem[contactMoment.onderwerp as string]
    );

    // menuItem only exists in myThemasMenuItems if that thema is active through the toggle and this person  has products in that thema.
    if (menuItem) {
      return {
        ...contactMoment,
        onderwerp: (
          <LinkdInline external={false} href={menuItem.to as string}>
            {menuItem.title as string}
          </LinkdInline>
        ),
      };
    } else return contactMoment;
  }

  const brpProfileData = useMemo(() => {
    if (
      FeatureToggle.residentCountActive &&
      typeof residentCount === 'number' &&
      // BRP.content?.adres?.adresType === 'woon'
      BRP.content?.adres // quick fix for https://datapunt.atlassian.net/browse/MIJN-4022
    ) {
      const brpContent = {
        ...BRP.content,
        adres: {
          ...BRP.content.adres,
          aantalBewoners: residentCount,
          wozWaarde: (
            <>
              Te vinden op{' '}
              <LinkdInline
                external={true}
                href="https://www.wozwaardeloket.nl/"
              >
                WOZ-waardeloket
              </LinkdInline>
            </>
          ),
        },
      };
      return formatBrpProfileData(brpContent);
    }
    return BRP.content ? formatBrpProfileData(BRP.content) : BRP.content;
  }, [BRP.content, residentCount]);

  if (SALESFORCE.content && brpProfileData) {
    // first fill the contactmomenten with the data from salesforce and add AppState information for links to themapages.
    brpProfileData.contactmomenten = SALESFORCE.content.map(
      (contactmomentItem) => {
        return getLinkToThemaPage(contactmomentItem);
      }
    );

    // then format the contactmomenten for icons and dates
    brpProfileData.contactmomenten = brpProfileData!.contactmomenten.map(
      (contactMomentItem) =>
        format(
          contactMoment,
          contactMomentItem,
          brpProfileData!.contactmomenten
        )
    );
  }

  // Fetch the resident count data
  useEffect(() => {
    if (
      FeatureToggle.residentCountActive &&
      BRP.content?.adres?._adresSleutel &&
      BRP.content?.adres?.landnaam === 'Nederland' &&
      BRP.content?.fetchUrlAantalBewoners
    ) {
      fetchResidentCount({
        url: BRP.content?.fetchUrlAantalBewoners ?? '',
      });
    }
  }, [BRP.content, fetchResidentCount]);

  return (
    <DetailPage className={styles.Profile}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ThemaIcon />}
        isLoading={false}
      >
        Mijn gegevens
      </PageHeading>

      <PageContent className={styles.Intro}>
        <p>
          In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of
          uw burgerlijke staat. De gemeente gebruikt deze gegevens. Belangrijk
          dus dat deze gegevens kloppen.
        </p>

        {!isLoading(BRP) && !isMokum(BRP.content) && (
          <p>
            U staat niet ingeschreven in Amsterdam. Daarom ziet u alleen
            gegevens die de gemeente Amsterdam van u heeft.
          </p>
        )}
        {hasDutchAndOtherNationalities(BRP.content) && (
          <p>
            Als u een andere nationaliteit hebt of hebt gehad naast de
            Nederlandse, dan ziet u alleen uw Nederlandse nationaliteit. U ziet
            alleen uw buitenlandse nationaliteit of nationaliteiten als u op dit
            moment geen Nederlandse nationaliteit hebt.
          </p>
        )}

        {isLoading(BRP) && (
          <div className={styles.LoadingContent}>
            <LoadingContent />
            <LoadingContent />
            <LoadingContent />
          </div>
        )}
        <MaintenanceNotifications page="persoonlijke-gegevens" />
        {isError(BRP) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}

        {BRP.content?.persoon.vertrokkenOnbekendWaarheen && (
          <ErrorAlert
            severity="warning"
            title="Vertrokken Onbekend Waarheen"
            className={styles.AlertVertrokkenOnbekendWaarheen}
          >
            U staat sinds{' '}
            {BRP.content?.persoon.datumVertrekUitNederland
              ? defaultDateFormat(BRP.content?.persoon.datumVertrekUitNederland)
              : 'enige tijd'}{' '}
            in de Basisregistratie Personen (BRP) met de melding ‘Vertrokken
            Onbekend Waarheen (VOW)’.
            <br />
            Als u in de BRP staat met de melding ‘Vertrokken Onbekend Waarheen
            (VOW)’ bent u onvindbaar voor de overheid. De overheid beschouwt u
            dan niet langer als inwoner van Nederland en u kunt geen gebruik
            meer maken van overheidsdiensten. U krijgt bijvoorbeeld geen
            paspoort, ziektekostenverzekering of toeslagen meer. Geef uw adres
            zo snel mogelijk door aan de gemeente.{' '}
            <LinkdInline
              external={true}
              aria-label="Meer informatie over de melding `Vertrokken Onbekend Waarheen (VOW)`"
              href="https://www.amsterdam.nl/veelgevraagd/onderzoek-naar-uw-inschrijving-in-de-basisregistratie-personen-brp-51319"
            >
              Meer informatie
            </LinkdInline>
          </ErrorAlert>
        )}

        {BRP.content?.persoon?.adresInOnderzoek && (
          <DSAlert
            severity="warning"
            title="Adres in onderzoek"
            className={styles.AlertAdresInOnderzoek}
          >
            <Paragraph>
              {BRP.content?.persoon?.adresInOnderzoek === '080000' ? (
                <>
                  Op dit moment onderzoeken wij of u nog steeds woont op het
                  adres waar u ingeschreven staat.
                </>
              ) : (
                <>
                  U woont niet meer op het adres waarop u staat ingeschreven. Op
                  dit moment onderzoeken wij op welk adres u nu woont.
                </>
              )}{' '}
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/veelgevraagd/onderzoek-naar-uw-inschrijving-in-de-basisregistratie-personen-brp-51319"
              >
                Kijk voor meer informatie over een adresonderzoek op
                amsterdam.nl
              </LinkdInline>
              .
            </Paragraph>
            <Paragraph>
              Kloppen uw gegevens niet? Voorkom een boete en stuur een e-mail
              naar{' '}
              <a
                href="mailto:adresonderzoek.basisinformatie@amsterdam.nl"
                rel="external noopener noreferrer"
              >
                adresonderzoek.basisinformatie@amsterdam.nl
              </a>
              .
            </Paragraph>
          </DSAlert>
        )}
      </PageContent>

      {!!brpProfileData?.contactmomenten &&
        brpProfileData.contactmomenten.length > 0 && (
          <SectionCollapsible
            id="SectionCollapsible-complaints"
            title="Contactmomenten"
            noItemsMessage="U heeft nog geen geregisteerd contact gemaakt met de gemeente Amsterdam."
            startCollapsed={false}
          >
            <TableV2
              items={brpProfileData.contactmomenten}
              displayProps={contactmomentenDisplayProps}
            />
          </SectionCollapsible>
        )}

      {!!brpProfileData?.persoon && (
        <InfoPanel
          className={styles.DefaultPanel}
          {...formatInfoPanelConfig(panelConfig.persoon, BRP)}
          panelData={brpProfileData.persoon}
        />
      )}

      {!!brpProfileData?.adres && (
        <InfoPanel
          className={classnames(styles.DefaultPanel, styles.AddressPanel)}
          {...formatInfoPanelConfig(panelConfig.adres, BRP)}
          panelData={brpProfileData.adres}
        />
      )}

      {!!brpProfileData?.verbintenis && (
        <InfoPanelCollapsible
          id="profile-verbintenis"
          className={classnames(styles.Verbintenis, styles.CollapsiblePanel)}
          {...formatInfoPanelConfig(panelConfig.verbintenis, BRP)}
          panelData={brpProfileData.verbintenis}
        />
      )}

      {!!brpProfileData?.verbintenisHistorisch &&
        brpProfileData?.verbintenisHistorisch.length && (
          <InfoPanelCollapsible
            id="profile-verbintenisHistorisch"
            className={classnames(styles.Verbintenis, styles.CollapsiblePanel)}
            {...formatInfoPanelConfig(panelConfig.verbintenisHistorisch, BRP)}
            panelData={brpProfileData.verbintenisHistorisch}
          />
        )}

      {!!brpProfileData?.kinderen && brpProfileData.kinderen.length && (
        <InfoPanelCollapsible
          id="profile-kinderen"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfig.kinderen, BRP)}
          panelData={brpProfileData.kinderen}
        />
      )}

      {!!brpProfileData?.ouders && brpProfileData.ouders.length && (
        <InfoPanelCollapsible
          id="profile-ouders"
          className={styles.CollapsiblePanel}
          {...formatInfoPanelConfig(panelConfig.ouders, BRP)}
          panelData={brpProfileData.ouders}
        />
      )}

      {!!brpProfileData?.adresHistorisch &&
        brpProfileData?.adresHistorisch.length && (
          <InfoPanelCollapsible
            id="profile-adresHistorisch"
            className={styles.CollapsiblePanel}
            {...formatInfoPanelConfig(panelConfig.adresHistorisch, BRP)}
            panelData={brpProfileData.adresHistorisch}
          />
        )}
      {isMokum(BRP.content) && (
        <PageContent>
          <p className={styles.SuppressedParagraph}>
            Het is helaas niet mogelijk om de gegevens van een levenloos geboren
            kindje te tonen in Mijn Amsterdam. U kunt deze gegevens wel inzien
            in{' '}
            <LinkdInline href="https://mijn.overheid.nl" external={true}>
              MijnOverheid
            </LinkdInline>
            .
          </p>
          <p className={styles.SuppressedParagraph}>
            Op deze pagina laten wij uw gegevens zien uit de landelijke en
            Amsterdamse administratie. Gegevens die bij een andere gemeente zijn
            geregistreerd worden hier niet getoond.
          </p>
        </PageContent>
      )}
    </DetailPage>
  );
}
