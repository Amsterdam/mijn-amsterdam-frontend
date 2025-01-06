import { useEffect, useMemo } from 'react';

import {
  Alert as DSAlert,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { formatBrpProfileData } from './formatDataPrivate';
import styles from './Profile.module.scss';
import { PanelConfigFormatter, panelConfig } from './profilePanelConfig';
import { useContactmomenten } from './useContactmomenten.hook';
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
  ThemaIcon,
} from '../../components';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { useDataApi } from '../../hooks/api/useDataApi';
import { useAppStateGetter } from '../../hooks/useAppState';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  BRP: AppState['BRP']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(BRP);
  }
  return panelConfig;
}

export const contactmomentenDisplayProps: DisplayProps<ContactMoment> = {
  kanaal: 'Contactvorm',
  onderwerp: 'Onderwerp',
  plaatsgevondenOp: 'Datum',
  nummer: 'Referentienummer',
};

export default function Profile() {
  const { BRP } = useAppStateGetter();
  const { items: contactmomentenItems } = useContactmomenten();

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
      <Screen>
        {contactmomentenItems && (
          <CollapsiblePanel title="Contactmomenten" startCollapsed={true}>
            <Paragraph>
              Dit is een overzicht van de momenten dat u contact had met
              gemeente Amsterdam. Dat zijn telefoontjes naar telefoonnummer 14
              020, vragen vanuit het contactformulier en chatberichten via de
              website. In dit overzicht staan niet alle mogelijke contacten.
              Brieven, klachten vanuit het klachtenformulier, whatsappjes en
              social mediaberichten staan hier niet in.
            </Paragraph>
            <Paragraph>
              Wilt u een eerder contactmoment doorgeven bij een volgende vraag?
              Geef dan het referentienummer door.
            </Paragraph>
            <TableV2
              items={contactmomentenItems.slice(
                0,
                MAX_TABLE_ROWS_ON_THEMA_PAGINA
              )}
              displayProps={contactmomentenDisplayProps}
            />
            {contactmomentenItems.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
              <LinkToListPage
                count={contactmomentenItems.length}
                route={AppRoutes['SALESFORCE/CONTACTMOMENTEN']}
              />
            )}
          </CollapsiblePanel>
        )}
      </Screen>

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
