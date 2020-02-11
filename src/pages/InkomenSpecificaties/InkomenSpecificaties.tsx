import React, { useContext } from 'react';
import { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './InkomenSpecificaties.module.scss';
import { OverviewPage } from '../../components/Page/Page';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import useRouter from 'use-react-router';
import TableSectionCollapsible from 'components/TableSectionCollapsible/TableSectionCollapsible';
import Table from 'components/Table/Table';
import Section from 'components/Section/Section';

export default () => {
  const {
    FOCUS_INKOMEN_SPECIFICATIES: { data: items, isError, isLoading },
  } = useContext(AppContext);
  const {
    match: {
      params: { type },
    },
  } = useRouter();
  const isAnnualStatementOverviewPage = type === 'jaaropgaven';
  const itemsFiltered = items.filter(item =>
    isAnnualStatementOverviewPage
      ? item.isAnnualStatement
      : !item.isAnnualStatement
  );

  return (
    <OverviewPage className={styles.InkomenSpecificaties}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        Bijstandsuitkering {isAnnualStatementOverviewPage && 'Jaaropgaven'}
      </PageHeading>
      <PageContent>
        {isError && (
          <Alert type="warning">
            We kunnen op dit moment niet alle gegevens tonen.
          </Alert>
        )}
      </PageContent>
      <Section
        className={styles.TableSection}
        title={
          isAnnualStatementOverviewPage
            ? 'Jaaropgaven'
            : 'Uitkeringsspecificaties'
        }
        isLoading={isLoading}
        hasItems={!!itemsFiltered.length}
        noItemsMessage="Er zijn op dit moment nog geen documenten beschikbaar."
      >
        <Table
          items={itemsFiltered}
          displayProps={{
            title: 'Omschrijving',
            type: 'Type',
            displayDate: 'Datum',
            documentUrl: 'Document',
          }}
        />
      </Section>
    </OverviewPage>
  );
};
