import Linkd, { LinkdInline } from '../../components/Button/Button';
import { OverviewPage, PageContent } from '../../components/Page/Page';
import React, { useContext, useMemo } from 'react';
import Table, { addTitleLinkComponent } from '../../components/Table/Table';

import Alert from '../../components/Alert/Alert';
import { AppContext } from '../../AppState';
import ChapterIcon from '../../components/ChapterIcon/ChapterIcon';
import { ChapterTitles } from '../../config/Chapter.constants';
import { ExternalUrls } from '../../config/App.constants';
import PageHeading from '../../components/PageHeading/PageHeading';
import SectionCollapsible from '../../components/SectionCollapsible/SectionCollapsible';
import styles from './Zorg.module.scss';

const DISPLAY_PROPS = {
  title: '',
};

export default () => {
  const {
    WMO: { data: items, isError, isLoading },
  } = useContext(AppContext);

  const itemsActual = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => item.isActual));
  }, [items]);
  const itemsPrevious = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => !item.isActual));
  }, [items]);

  const hasActualItems = !!itemsActual.length;

  return (
    <OverviewPage className={styles.ZorgOverviewPage}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.ZORG}</PageHeading>
      <PageContent>
        <p>
          Hieronder ziet u uw regelingen en hulpmiddelen vanuit de Wmo. Hebt u
          vragen of wilt u een wijziging doorgeven? Bel dan gratis de Wmo
          Helpdesk:{' '}
          <LinkdInline external={true} href="tel:08000643">
            0800 0643
          </LinkdInline>
          . Of ga langs bij het Sociaal Loket.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.ZORG_LEES_MEER}>
            Lees hier meer over zorg en ondersteuning
          </Linkd>
        </p>
        {isError && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-healthcare-granted"
        title="Huidige voorzieningen"
        noItemsMessage="U hebt nog geen huidige voorzieningen."
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading}
        track={{
          category: 'Zorg en ondersteuning overzicht / Huidige voorzieningen',
          name: 'Datatabel',
        }}
      >
        <Table displayProps={DISPLAY_PROPS} items={itemsActual} />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-healthcare-previous"
        title="Eerdere voorzieningen"
        noItemsMessage="U hebt geen eerdere voorzieningen."
        startCollapsed={hasActualItems}
        isLoading={isLoading}
        track={{
          category: 'Zorg en ondersteuning overzicht / Eerdere voorzieningen',
          name: 'Datatabel',
        }}
      >
        <Table displayProps={DISPLAY_PROPS} items={itemsPrevious} />
      </SectionCollapsible>
      <p className={styles.HistoricItemsMention}>
        Informatie van voor 1 januari 2018 kunt u hier niet inzien. Deze kunt u
        wel opvragen bij de Wmo Helpdesk.
      </p>
    </OverviewPage>
  );
};
