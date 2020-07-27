import React, { useMemo } from 'react';
import { ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Burgerzaken.module.scss';

const DISPLAY_PROPS = {
  title: '',
  datumAfloop: 'Geldig tot',
};

export default () => {
  const { BRP } = useAppStateGetter();

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
          Hier ziet u tot wanneer uw paspoort of ID-kaart geldig is. Als u
          doorklikt ziet u ook het documentnummer en de datum van uitgifte.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/"
          >
            Meer informatie over paspoort en ID-kaart
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
