import { useMemo } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  Linkd,
  LinkdInline,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  ThemaIcon,
  addTitleLinkComponent,
} from '../../components';
import { ExternalUrls } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Zorg.module.scss';

const DISPLAY_PROPS = {
  voorziening: 'Voorziening',
  status: 'Status',
  dateDescision: 'Datum',
};

export default function Zorg() {
  const { WMO } = useAppStateGetter();

  const itemsActual = useMemo(() => {
    if (!WMO.content?.length) {
      return [];
    }
    return addTitleLinkComponent(WMO.content?.filter((item) => item.isActual));
  }, [WMO]);

  const itemsPrevious = useMemo(() => {
    if (!WMO.content?.length) {
      return [];
    }
    return addTitleLinkComponent(WMO.content?.filter((item) => !item.isActual));
  }, [WMO]);

  return (
    <OverviewPage className={styles.ZorgOverviewPage}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.ZORG}
      </PageHeading>
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
        <p>
          <Linkd external={true} href={ExternalUrls.ZORG_LEES_MEER}>
            Documenten uploaden voor de Wmo
          </Linkd>
        </p>
        <MaintenanceNotifications page="zorg" />
        {isError(WMO) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-healthcare-granted"
        title="Huidige regelingen en hulpmiddelen"
        noItemsMessage="U heeft geen huidige regelingen en hulpmiddelen."
        hasItems={!!itemsActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(WMO)}
      >
        <Table displayProps={DISPLAY_PROPS} items={itemsActual} />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-healthcare-previous"
        title="Eerdere regelingen en hulpmiddelen"
        noItemsMessage="U heeft geen eerdere regelingen en hulpmiddelen."
        hasItems={!!itemsPrevious.length}
        startCollapsed={true}
        isLoading={isLoading(WMO)}
      >
        <Table displayProps={DISPLAY_PROPS} items={itemsPrevious} />
      </SectionCollapsible>
      <p className={styles.HistoricItemsMention}>
        U ziet hier alleen informatie vanaf 1 januari 2018. Bel voor informatie
        van eerdere jaren de Wmo Helpdesk: 0800 0643.
      </p>
    </OverviewPage>
  );
}
