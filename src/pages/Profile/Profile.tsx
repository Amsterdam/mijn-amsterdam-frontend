import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import { formatProfileData, panelConfig } from 'data-formatting/brp';
import { entries } from 'helpers/App';
import styles from 'pages/Profile/Profile.module.scss';
import React, { useContext } from 'react';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import pageContentStyles from 'components/PageContentMain/PageContentMain.module.scss';
import classnames from 'classnames';

export default function Profile() {
  const { BRP } = useContext(AppContext);
  const brpInfo = formatProfileData(BRP.data);

  return (
    <PageContentMain
      className={classnames(pageContentStyles.DetailPage, styles.Profile)}
    >
      <PageContentMainHeading
        icon={<ChapterIcon chapter={Chapters.BURGERZAKEN} />}
      >
        Mijn gegevens
      </PageContentMainHeading>
      <div className={classnames(pageContentStyles.PageContent, styles.Intro)}>
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
      </div>
      <div className={styles.InfoPanels}>
        {brpInfo &&
          entries(brpInfo).map(
            ([id, panelData]) =>
              panelData && ( // TS compiler complains when using regular filtering.
                <InfoPanel
                  key={id}
                  {...panelConfig[id]}
                  panelData={panelData}
                />
              )
          )}
      </div>
    </PageContentMain>
  );
}
