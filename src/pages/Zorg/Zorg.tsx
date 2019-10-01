import React, { useContext } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import { Chapters } from 'App.constants';
import styles from './Zorg.module.scss';
import Alert from 'components/Alert/Alert';
import { useTabletScreen } from 'hooks/media.hook';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import { ExternalUrls, ChapterTitles } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

const DISPLAY_PROPS = {
  title: '',
};

export default () => {
  const {
    WMO: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const itemsActual = items.filter(item => item.isActual);
  const itemsPrevious = items.filter(item => !item.isActual);
  const hasActualItems = !!itemsActual.length;
  const isTabletScreen = useTabletScreen();

  return (
    <OverviewPage>
      <PageHeading icon={<ChapterIcon chapter={Chapters.ZORG} />}>
        {ChapterTitles.ZORG}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder ziet u uw regelingen en hulpmiddelen vanuit de Wmo. Hebt u
          vragen of wilt u een wijziging doorgeven? Bel dan gratis de Wmo
          Helpdesk: <a href="tel:08000643">0800 0643</a>. Of ga langs bij het
          Sociaal Loket.
        </p>
        <p>
          <ButtonLinkExternal to={ExternalUrls.ZORG_LEES_MEER}>
            Lees hier meer over zorg en ondersteuning
          </ButtonLinkExternal>
        </p>
        {isError && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
      </PageContent>
      <DataLinkTable
        id="datalinktable-healthcare-granted"
        rowHeight={isTabletScreen ? 'auto' : '5.8rem'}
        displayProps={DISPLAY_PROPS}
        items={itemsActual}
        title="Mijn huidige voorzieningen"
        noItemsMessage="U hebt nog geen huidige voorzieningen."
        startCollapsed={false}
        className={styles.DataLinkTableCurrent}
        isLoading={isLoading}
        trackCategory="Zorg en ondersteuning overzicht / Huidige voorzieningen"
      />

      <DataLinkTable
        id="datalinktable-healthcare-previous"
        rowHeight={isTabletScreen ? 'auto' : '5.8rem'}
        displayProps={DISPLAY_PROPS}
        items={itemsPrevious}
        title="Mijn eerdere voorzieningen"
        noItemsMessage="U hebt geen eerdere voorzieningen."
        startCollapsed={hasActualItems}
        isLoading={isLoading}
        trackCategory="Zorg en ondersteuning overzicht / Eerdere voorzieningen"
      />
      <p className={styles.HistoricItemsMention}>
        Informatie van voor 1 januari 2018 kunt u hier niet inzien. Deze kunt u
        wel opvragen bij de Wmo Helpdesk.
      </p>
    </OverviewPage>
  );
};
