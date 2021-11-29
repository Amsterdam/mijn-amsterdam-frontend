import classnames from 'classnames';
import { useEffect, useMemo } from 'react';
import {
  apiPristineResult,
  ApiResponse,
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  hasDutchAndOtherNationalities,
  isMokum,
} from '../../../universal/helpers/brp';
import { AppState } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoPanel,
  InfoPanelCollapsible,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
  MaintenanceNotifications,
} from '../../components';
import { BRP_RESIDENTS_API_URL } from '../../config/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import { useAppStateGetter } from '../../hooks/useAppState';
import { formatBrpProfileData } from './formatDataPrivate';
import { panelConfig, PanelConfigFormatter } from './profilePanelConfig';
import styles from './Profile.module.scss';
import { apiSuccesResult } from '../../../universal/helpers/api';
import { FeatureToggle } from '../../../universal/config/app';
import { AppRoutes } from '../../../universal/config';

function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  BRP: AppState['BRP']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(BRP);
  }
  return panelConfig;
}

export default function Profile() {
  const { BRP } = useAppStateGetter();

  const [{ data: residentData }, fetchResidentCount] = useDataApi<
    ApiResponse<{ residentCount: number }>
  >(
    {
      url: BRP_RESIDENTS_API_URL,
      postpone: true,
      method: 'post',
      transformResponse: (responseContent) => apiSuccesResult(responseContent),
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
      BRP.content?.adres?.landnaam === 'Nederland' &&
      BRP.content?.adres?._adresSleutel
    ) {
      fetchResidentCount({
        data: { addressKey: BRP.content?.adres?._adresSleutel },
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
        icon={<ChapterIcon />}
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
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}

        {BRP.content?.persoon.vertrokkenOnbekendWaarheen && (
          <Alert type="warning" className="vertrokkenOnbekendWaarheen">
            <p>
              U staat sinds{' '}
              {BRP.content?.persoon.datumVertrekUitNederland
                ? defaultDateFormat(
                    BRP.content?.persoon.datumVertrekUitNederland
                  )
                : 'enige tijd'}{' '}
              in de Basisregistratie Personen (BRP) met de melding ‘Vertrokken
              Onbekend Waarheen (VOW)’.
            </p>
            <p>
              Als u in de BRP staat met de melding ‘Vertrokken Onbekend Waarheen
              (VOW)’ bent u onvindbaar voor de overheid. De overheid beschouwt u
              dan niet langer als inwoner van Nederland en u kunt geen gebruik
              meer maken van overheidsdiensten. U krijgt bijvoorbeeld geen
              paspoort, ziektekostenverzekering of toeslagen meer. Geef uw adres
              zo snel mogelijk door aan de gemeente.{' '}
              <LinkdInline
                external={true}
                aria-label="Meer informatie over de melding `Vertrokken Onbekend Waarheen (VOW)`"
                href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BCAE578D9-A593-40FC-97C6-46BEA5B51319%7D"
              >
                Meer informatie
              </LinkdInline>
            </p>
          </Alert>
        )}

        {BRP.content?.adres?.inOnderzoek && (
          <Alert type="warning" className="inOnderzoek">
            <p>
              Op dit moment onderzoeken wij of u nog steeds woont op het adres
              waar u ingeschreven staat.{' '}
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BCAE578D9-A593-40FC-97C6-46BEA5B51319%7D"
              >
                Kijk voor meer informatie over een adresonderzoek op
                amsterdam.nl
              </LinkdInline>
              .
            </p>
            <p>
              Kloppen uw gegevens niet? Voorkom een boete en stuur een e-mail
              naar{' '}
              <a
                href="mailto:adresonderzoek.basisinformatie@amsterdam.nl"
                rel="external noopener noreferrer"
              >
                adresonderzoek.basisinformatie@amsterdam.nl
              </a>
              .
            </p>
          </Alert>
        )}
      </PageContent>

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
            Gegevens van een levenloos geboren kindje ziet u niet in Mijn
            Amsterdam. U kunt die gegevens alleen inzien via{' '}
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
