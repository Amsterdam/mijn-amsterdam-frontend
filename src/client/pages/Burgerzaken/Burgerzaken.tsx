import { useMemo } from 'react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Burgerzaken.module.scss';

const DISPLAY_PROPS_ID_KAARTEN = {
  title: '',
  datumAfloop: 'Geldig tot',
};

const DISPLAY_PROPS_AKTES = {
  type: '',
  aktenummer: 'Aktenummer',
  registerjaar: 'Registerjaar',
};

export default function Burgerzeken() {
  const { BRP, AKTES } = useAppStateGetter();

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

  const aktes = useMemo(() => {
    if (!AKTES.content?.length) {
      return [];
    }
    const items = AKTES.content.map((item) => {
      return {
        ...item,
        registerjaar: item.registerjaar,
      };
    });
    return addTitleLinkComponent(items, 'type');
  }, [AKTES.content]);

  return (
    <OverviewPage className={styles.BurgerzakenOverviewPage}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(BRP)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.BURGERZAKEN}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder vindt u informatie over uw officiële documenten, zoals uw
          paspoort of aktes. Als u gaat trouwen of een partnerschap aangaat, dan
          ziet u hier de aankondiging.
        </p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/burgerzaken">
            Overzicht en aanvragen bij burgerzaken
          </Linkd>
        </p>
        <MaintenanceNotifications page="burgerzaken" />
        {isError(BRP) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen ID-kaarten tonen.</p>
          </Alert>
        )}
        {isError(AKTES) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen aktes tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-offical-documents"
        title="Mijn ID-kaarten"
        className={styles.SectionCollapsibleIdKaarten}
        noItemsMessage="Wij kunnen nog geen ID-kaarten tonen."
        startCollapsed={false}
        hasItems={!!documentItems.length}
        isLoading={isLoading(BRP)}
        track={{
          category: 'Burgerzaken overzicht / ID-kaarten',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS_ID_KAARTEN}
          items={documentItems}
        />
      </SectionCollapsible>
      {!!aktes.length && (
        <>
          <SectionCollapsible
            id="SectionCollapsible-aktes"
            title="Mijn aktes"
            className={styles.SectionCollapsibleAktes}
            startCollapsed={true}
            hasItems={true}
            isLoading={false}
            track={{
              category: 'Burgerzaken overzicht / Mijn Aktes',
              name: 'Datatabel',
            }}
          >
            <Table
              className={styles.AktesTable}
              displayProps={DISPLAY_PROPS_AKTES}
              items={aktes}
            />
          </SectionCollapsible>
          <p className={styles.AktesDisclaimer}>
            Alleen akte indien rechtsfeit in amsterdam Akte is niet rechtsgeldig
            oid
          </p>
        </>
      )}
    </OverviewPage>
  );
}
