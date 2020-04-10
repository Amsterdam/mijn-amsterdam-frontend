import React, { useContext, useMemo } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import styles from './Burgerzaken.module.scss';
import Alert from 'components/Alert/Alert';
import { ChapterTitles } from 'config/Chapter.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Table, { addTitleLinkComponent } from 'components/Table/Table';

const DISPLAY_PROPS = {
  title: '',
  datumAfloop: 'datum afloop document',
};

export default () => {
  const {
    BRP: { data, isError, isLoading },
  } = useContext(AppContext);

  const documentItems = useMemo(() => {
    if (!data.reisDocumenten) {
      return [];
    }
    return addTitleLinkComponent(data.reisDocumenten);
  }, [data]);

  return (
    <OverviewPage className={styles.BurgerzakenOverviewPage}>
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.BURGERZAKEN}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder ziet u informatie over uw officiële documenten, zoals uw
          paspoort of rijbewijs. Als u gaat trouwen of een partnerschap aangaat,
          dan ziet u hier de aankondiging.
        </p>
        {isError && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-offical-documents"
        title="Mijn huidige documenten"
        noItemsMessage="Wij kunnen nog geen officiële documenten tonen."
        startCollapsed={false}
        isLoading={isLoading}
        track={{
          category: 'Burgerzaken overzicht / Huidige documenten',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS}
          items={documentItems}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
};
