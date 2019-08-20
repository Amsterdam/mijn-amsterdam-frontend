import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import styles from './Zorg.module.scss';
import Alert from 'components/Alert/Alert';
import { useTabletScreen } from 'hooks/media.hook';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import { ExternalUrls } from 'App.constants';
import { ChapterTitles } from '../../App.constants';

const DISPLAY_PROPS = {
  title: 'Regeling',
};

export default () => {
  const {
    WMO: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const itemsRequested = items.filter(
    item => item.isActual && !item.dateFinish
  );
  const itemsActual = items.filter(item => item.isActual && !!item.dateFinish);
  const itemsPrevious = items.filter(item => !item.isActual);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActualItems = !!itemsActual.length;

  const isTabletScreen = useTabletScreen();

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        {ChapterTitles.ZORG}
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        <p>
          Hieronder ziet u uw regelingen en hulpmiddelen vanuit de Wmo. Hebt u
          vragen of wilt u een wijziging doorgeven? Bel dan gratis de Wmo
          Helpdesk: <a href="tel:08000643">0800 0643</a>. Of ga langs bij het
          Sociaal Loket.
        </p>
        <p>
          <ButtonLinkExternal to={ExternalUrls.ZORG_LEES_MEER}>
            Lees hier meer over Zorg en ondersteuning
          </ButtonLinkExternal>
        </p>
        {isError && (
          <Alert type="warning">
            Uw gegevens kunnen op dit moment niet worden getoond.
          </Alert>
        )}
        <DataLinkTable
          id="datalinktable-healthcare-granted"
          rowHeight={isTabletScreen ? 'auto' : '6rem'}
          displayProps={DISPLAY_PROPS}
          items={itemsActual}
          title="Mijn huidige voorzieningen"
          noItemsMessage="U hebt nog geen huidige voorzieningen."
          startCollapsed={hasActiveRequests}
          className={styles.DataLinkTableCurrent}
          isLoading={isLoading}
          trackCategory="MA_Zorg/Detail_Pagina/Huidige_voorzieningen"
        />
      </PageContentMainBody>
      <div className={styles.HistoricDataLinkTable}>
        <PageContentMainBody variant="boxed">
          <DataLinkTable
            id="datalinktable-healthcare-previous"
            rowHeight={isTabletScreen ? 'auto' : '6rem'}
            displayProps={DISPLAY_PROPS}
            items={itemsPrevious}
            title="Mijn eerdere voorzieningen"
            noItemsMessage="U hebt geen eerdere voorzieningen."
            startCollapsed={hasActiveRequests || hasActualItems}
            isLoading={isLoading}
            trackCategory="MA_Zorg/Detail_Pagina/Eerdere_voorzieningen"
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
