import {
  Alert,
  ChapterIcon,
  Linkd,
  LinkdInline,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { ChapterTitles, ExternalUrls } from '../../../universal/config';
import React, { useContext, useMemo } from 'react';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import { addTitleLinkComponent } from '../../components/Button/Button';
import styles from './Zorg.module.scss';

const DISPLAY_PROPS = {
  title: '',
};

export default () => {
  const { WMO } = useContext(AppContext);

  const itemsActual = useMemo(() => {
    if (!WMO.content?.items.length) {
      return [];
    }
    return addTitleLinkComponent(
      WMO.content?.items.filter(item => item.isActual)
    );
  }, [WMO]);

  const itemsPrevious = useMemo(() => {
    console.log(WMO.content?.items);
    if (!WMO.content?.items.length) {
      return [];
    }
    return addTitleLinkComponent(
      WMO.content?.items.filter(item => !item.isActual)
    );
  }, [WMO]);

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
        {isError(WMO) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-healthcare-granted"
        title="Huidige voorzieningen"
        noItemsMessage="U hebt geen huidige voorzieningen."
        hasItems={!!itemsActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(WMO)}
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
        hasItems={!!itemsPrevious.length}
        startCollapsed={hasActualItems}
        isLoading={isLoading(WMO)}
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
