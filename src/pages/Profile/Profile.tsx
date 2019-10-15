import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { DetailPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { panelConfig, formatProfileData } from 'data-formatting/brp';
import { entries } from 'helpers/App';
import styles from 'pages/Profile/Profile.module.scss';
import React, { useContext } from 'react';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default function Profile() {
  const { BRP } = useContext(AppContext);

  const brpData = BRP.isDirty ? formatProfileData(BRP.data) : null;

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
        {BRP.data &&
          BRP.data.persoon &&
          BRP.data.persoon.vertrokkenOnbekendWaarheen && (
            <Alert type="warning" className="vertrokkenOnbekendWaarheen">
              <p>
                U staat sinds {new Date().toISOString()} in de BRP geregistreerd
                als "vertrokken – onbekend waarheen". Kijk{' '}
                <a
                  rel="external noopener noreferrer"
                  href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BCAE578D9-A593-40FC-97C6-46BEA5B51319%7D"
                >
                  hier
                </a>{' '}
                voor meer informatie.
              </p>
              <p>
                U kunt uw huidige adres doorgeven bij het Stadsloket. U moet
                hiervoor{' '}
                <a
                  rel="external noopener noreferrer"
                  href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BCAE578D9-A593-40FC-97C6-46BEA5B51319%7D"
                >
                  een afspraak maken
                </a>
                .
              </p>
            </Alert>
          )}
        {BRP.data && BRP.data.adres && BRP.data.adres.inOnderzoek && (
          <Alert type="warning" className="inOnderzoek">
            <p>
              Op dit moment onderzoeken wij of u nog steeds woont op het adres
              waar u ingeschreven staat. Kijk{' '}
              <a
                href="https://www.amsterdam.nl/veelgevraagd/?productid={49AB6693-E7FA-4642-82F4-D14D87E02C72}"
                rel="external noopener noreferrer"
              >
                hier
              </a>{' '}
              voor meer informatie over het onderzoek naar uw inschrijving in de
              Basisregistratie Personen (BRP)
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
              . Of bel naar{' '}
              <a
                href="tel:020
              253 9068"
              >
                020 253 9068
              </a>
              .
            </p>
          </Alert>
        )}
      </PageContent>
      <div className={styles.InfoPanels}>
        {brpData &&
          brpData.person &&
          entries(brpData)
            .filter(([id, panelData]) => !!panelData)
            .map(([id, panelData]) => (
              <InfoPanel key={id} {...panelConfig[id]} panelData={panelData} />
            ))}
      </div>
    </DetailPage>
  );
}
