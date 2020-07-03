import React, { useContext, useMemo } from 'react';
import { ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import styles from './Burgerzaken.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';

const DISPLAY_PROPS = {
  title: '',
  datumAfloop: 'Geldig tot',
};

export default () => {
  const { BRP } = useContext(AppContext);

  const documentItems = useMemo(() => {
    if (!BRP.content?.identiteitsbewijzen) {
      return [];
    }
    const items = BRP.content?.identiteitsbewijzen.map(item => {
      return {
        ...item,
        datumAfloop: defaultDateFormat(item.datumAfloop),
      };
    });
    return addTitleLinkComponent(items);
  }, [BRP.content]);

  return (
    <OverviewPage className={styles.BurgerzakenOverviewPage}>
      <PageHeading isLoading={isLoading(BRP)} icon={<ChapterIcon />}>
        {ChapterTitles.BURGERZAKEN}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder ziet u informatie over de looptijd van uw officiële
          identiteitsbewijzen, zoals ID-kaart of paspoort.
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
        {isError(BRP) && (
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
        isLoading={isLoading(BRP)}
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
