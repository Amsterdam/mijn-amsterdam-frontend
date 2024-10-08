import { useMemo } from 'react';

import styles from './Burgerzaken.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  ErrorAlert,
  Linkd,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  ThemaIcon,
  addTitleLinkComponent,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS_ID_KAARTEN = {
  datumAfloop: 'Geldig tot',
};

export default function Burgerzaken() {
  const { BRP } = useAppStateGetter();

  const documentItems = useMemo(() => {
    if (!BRP.content?.identiteitsbewijzen) {
      return [];
    }
    const items = BRP.content.identiteitsbewijzen.map((item) => {
      return {
        ...item,
        datumAfloop: defaultDateFormat(item.datumAfloop),
      };
    });
    return addTitleLinkComponent(items);
  }, [BRP.content]);

  return (
    <OverviewPage className={styles.BurgerzakenOverviewPage}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(BRP)}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.BURGERZAKEN}
      </PageHeading>
      <PageContent>
        <p>Hieronder vindt u gegevens van uw paspoort en/of ID-kaart.</p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/burgerzaken">
            Overzicht en aanvragen bij burgerzaken
          </Linkd>
        </p>
        <MaintenanceNotifications page="burgerzaken" />
        {isError(BRP) && (
          <ErrorAlert>
            We kunnen op dit moment geen ID-kaarten tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-offical-documents"
        title="Mijn reisdocumenten"
        className={styles.SectionCollapsibleIdKaarten}
        noItemsMessage="Wij kunnen nog geen ID-kaarten tonen."
        startCollapsed={false}
        hasItems={!!documentItems.length}
        isLoading={isLoading(BRP)}
      >
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS_ID_KAARTEN}
          items={documentItems}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
