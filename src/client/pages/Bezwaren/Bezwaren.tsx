import { Page, PageContent, PageHeading, Table } from '../../components';
import styles from './Bezwaren.module.scss';

import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS_BEZWAREN = {
  identificatie: 'ID',
  omschrijving: 'Omschrijving',
  registratiedatum: 'Ingestuurd op',
};

export default function BEZWAREN() {
  const { BEZWAREN } = useAppStateGetter();

  return (
    <Page>
      <PageHeading>Bezwaren</PageHeading>
      <PageContent>
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS_BEZWAREN}
          items={BEZWAREN.content ?? []}
        />
      </PageContent>
    </Page>
  );
}
