import React, { useContext } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import { Chapters, ChapterTitles } from 'App.constants';
import styles from './Inkomen.module.scss';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import { ExternalUrls } from 'App.constants';
import Alert from 'components/Alert/Alert';
import { useTabletScreen } from 'hooks/media.hook';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

const DISPLAY_PROPS = {
  datePublished: 'besluit',
};

const DISPLAY_PROPS_ACTUAL = {
  dateStart: 'aanvraag',
};

export default () => {
  const {
    FOCUS: {
      data: { products },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const items = Object.values(products).flatMap(product => product.items);

  const itemsRequested = items.filter(item => !item.hasDecision);
  const itemsDecided = items.filter(item => item.hasDecision);
  const hasActiveRequests = !!itemsRequested.length;
  const isTabletScreen = useTabletScreen();

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.INKOMEN} />}>
        {ChapterTitles.INKOMEN}
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
        id="datalinktable-income-actual"
        rowHeight={isTabletScreen ? 'auto' : '5.8rem'}
        displayProps={DISPLAY_PROPS_ACTUAL}
        items={itemsRequested}
        title="Mijn lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoading}
        trackCategory="Werk en inkomen overzicht / Lopende aanvragen"
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
      />
      <DataLinkTable
        id="datalinktable-income-granted"
        rowHeight={isTabletScreen ? 'auto' : '5.8rem'}
        displayProps={DISPLAY_PROPS}
        items={itemsDecided}
        startCollapsed={hasActiveRequests}
        isLoading={isLoading}
        title="Mijn besluiten"
        trackCategory="Werk en inkomen overzicht / Besluiten"
        noItemsMessage="U hebt op dit moment geen besluiten."
      />
    </OverviewPage>
  );
};
