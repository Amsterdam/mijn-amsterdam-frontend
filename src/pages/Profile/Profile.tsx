import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { DetailPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { panelConfig } from './Profile.constants';
import styles from 'pages/Profile/Profile.module.scss';
import React, { useContext } from 'react';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { defaultDateFormat } from 'helpers/App';
import { LinkdInline } from 'components/Button/Button';
import { useMemo } from 'react';
import { formatBrpProfileData } from 'data-formatting/brp';
import { InfoPanelCollapsible } from '../../components/InfoPanel/InfoPanel';

export default function Profile() {
  const { BRP } = useContext(AppContext);

  const { isDirty, isError, data } = BRP;
  const [adres] = data?.adres || [];
  const brpProfileData = useMemo(() => {
    const rData = isDirty && !isError ? data : null;
    return rData ? formatBrpProfileData(rData) : rData;
  }, [data, isDirty, isError]);

  return (
    <DetailPage className={styles.Profile}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.BURGERZAKEN} />}>
        Mijn gegevens
      </PageHeading>
      <PageContent className={styles.Intro}>
        <p>
          In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of
          uw burgerlijke staat. De gemeente gebruikt deze gegevens. Belangrijk
          dus dat deze gegevens kloppen.
        </p>

        {BRP.isLoading && (
          <div className={styles.LoadingContent}>
            <LoadingContent />
            <LoadingContent />
            <LoadingContent />
          </div>
        )}

        {BRP.isError && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}

        {data.persoon?.vertrokkenOnbekendWaarheen && (
          <Alert type="warning" className="vertrokkenOnbekendWaarheen">
            <p>
              U staat sinds{' '}
              {data.persoon.datumVertrekUitNederland
                ? defaultDateFormat(data.persoon.datumVertrekUitNederland)
                : 'enige tijd'}{' '}
              in de BRP geregistreerd als "vertrokken – onbekend waarheen".
            </p>
            <p>
              U kunt uw huidige adres doorgeven bij het Stadsloket. U moet
              hiervoor een{' '}
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BCAE578D9-A593-40FC-97C6-46BEA5B51319%7D"
              >
                afspraak
              </LinkdInline>{' '}
              maken .
            </p>
          </Alert>
        )}

        {adres?.inOnderzoek && (
          <Alert type="warning" className="inOnderzoek">
            <p>
              Op dit moment onderzoeken wij of u nog steeds woont op het adres
              waar u ingeschreven staat. Kijk voor{' '}
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/veelgevraagd/?productid={49AB6693-E7FA-4642-82F4-D14D87E02C72}"
              >
                meer
              </LinkdInline>{' '}
              informatie over onderzoek naar uw inschrijving in de
              Basisregistratie Personen (BRP).
            </p>
            <p>
              Kloppen uw gegevens niet? Voorkom een boete en stuur een bericht
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
          {...panelConfig.persoon}
          panelData={brpProfileData.persoon}
        />
      )}

      {!!brpProfileData?.adres && (
        <InfoPanel
          className={styles.DefaultPanel}
          {...panelConfig.adres}
          panelData={brpProfileData.adres}
        />
      )}

      {!!brpProfileData?.verbintenis && (
        <InfoPanelCollapsible
          id="profile.verbintenis"
          title={panelConfig.verbintenis.title}
          actionLinks={panelConfig.verbintenis.actionLinks}
          panelData={brpProfileData.verbintenis}
        />
      )}

      {!!brpProfileData?.kinderen && (
        <InfoPanelCollapsible
          id="profile.kinderen"
          title={panelConfig.kinderen.title}
          actionLinks={panelConfig.kinderen.actionLinks}
          panelData={brpProfileData.kinderen}
        />
      )}
    </DetailPage>
  );
}
