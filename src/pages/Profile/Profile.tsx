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
  const brpData = formatProfileData(BRP.data);

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
            We kunnen op dit moment geen gegevens tonen.
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
