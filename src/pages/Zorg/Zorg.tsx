import React, { useContext } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import TableSectionCollapsible from 'components/TableSectionCollapsible/TableSectionCollapsible';
import styles from './Zorg.module.scss';
import Alert from 'components/Alert/Alert';
import Linkd, { LinkdInline } from 'components/Button/Button';
import { ExternalUrls } from 'config/App.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

const DISPLAY_PROPS = {
  title: '',
};

export default () => {
  const {
    WMO: { data: items, isError, isLoading },
  } = useContext(AppContext);

  const itemsActual = items.filter(item => item.isActual);
  const itemsPrevious = items.filter(item => !item.isActual);
  const hasActualItems = !!itemsActual.length;

  return (
    <OverviewPage>
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
      <TableSectionCollapsible
        id="TableSectionCollapsible-healthcare-granted"
        displayProps={DISPLAY_PROPS}
        items={itemsActual}
        title="Huidige voorzieningen"
        noItemsMessage="U hebt nog geen huidige voorzieningen."
        startCollapsed={false}
        className={styles.TableSectionCollapsibleCurrent}
        isLoading={isLoading}
        track={{
          category: 'Zorg en ondersteuning overzicht / Huidige voorzieningen',
          name: 'Datatabel',
        }}
      />

      <TableSectionCollapsible
        id="TableSectionCollapsible-healthcare-previous"
        displayProps={DISPLAY_PROPS}
        items={itemsPrevious}
        title="Eerdere voorzieningen"
        noItemsMessage="U hebt geen eerdere voorzieningen."
        startCollapsed={hasActualItems}
        isLoading={isLoading}
        track={{
          category: 'Zorg en ondersteuning overzicht / Eerdere voorzieningen',
          name: 'Datatabel',
        }}
      />
      <p className={styles.HistoricItemsMention}>
        Informatie van voor 1 januari 2018 kunt u hier niet inzien. Deze kunt u
        wel opvragen bij de Wmo Helpdesk.
      </p>
    </OverviewPage>
  );
};
