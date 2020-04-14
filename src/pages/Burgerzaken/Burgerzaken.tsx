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
import Linkd from '../../components/Button/Button';

const DISPLAY_PROPS = {
  title: '',
  datumAfloop: 'Geldig tot',
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
          Hieronder ziet u informatie over de looptijd van uw officiële
          reisdocumenten, zoals ID-kaart of paspoort.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/"
          >
            Meer informatie over paspoort en ID-kaart
          </Linkd>
          <br />
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid={EFDC353E-5E80-4B9C-8431-2FBB950ECE7C}"
          >
            Paspoort kwijt?
          </Linkd>
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
        className={styles.SectionCollapsibleDocuments}
        noItemsMessage="Wij kunnen nog geen officiële documenten tonen."
        startCollapsed={false}
        hasItems={!!documentItems.length}
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
