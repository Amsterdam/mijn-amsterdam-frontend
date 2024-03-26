import {
  ErrorAlert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import styles from './Bezwaren.module.scss';

import { useAppStateGetter } from '../../hooks/useAppState';
import { defaultDateFormat, isLoading , isError} from '../../../universal/helpers';
import { AppRoutes} from '../../../universal/config';

const DISPLAY_PROPS_BEZWAREN = {
  identificatie: 'Zaaknummer',
  ontvangstdatum: 'Ontvangen op',
  omschrijving: 'Onderwerp',
};

export default function BEZWAREN() {
  const { BEZWAREN } = useAppStateGetter();

  const items = addTitleLinkComponent(
    BEZWAREN.content ?? [],
    'identificatie'
  ).map((bezwaar) => ({
    ...bezwaar,
    ontvangstdatum: defaultDateFormat(bezwaar.ontvangstdatum),
  }));

  const ingediendeBezwaren =
    items.filter((bezwaar) => bezwaar.status !== 'Afgehandeld') ?? [];
  const afgehandeldeBezwaren =
    items.filter((bezwaar) => bezwaar.status === 'Afgehandeld') ?? [];

  return (
    <OverviewPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(BEZWAREN)}
        icon={<ChapterIcon />}
      >
        Bezwaren
      </PageHeading>
      <PageContent>
        <p>Hier ziet u een overzicht van uw ingediende bezwaren.</p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/bezwaar-maken-tegen-een-besluit-van-de-gemeente-amsterdam-e5898"
          >
            Meer informatie over Bezwaar maken
          </Linkd>
        </p>
        {isError(BEZWAREN) && (
          <ErrorAlert>
            We kunnen op dit moment geen bezwaren tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Lopende bezwaren"
        noItemsMessage="U heeft geen lopende zaken. Het kan zijn dat een ingediend bezwaar nog niet is geregistreerd."
        startCollapsed={false}
        hasItems={!!ingediendeBezwaren?.length}
        isLoading={isLoading(BEZWAREN)}
        className={styles.SectionCollapsibleFirst}
      >
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS_BEZWAREN}
          items={ingediendeBezwaren}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Afgehandelde bezwaren"
        noItemsMessage="U hebt nog geen afgehandelde bezwaren."
        startCollapsed={false}
        hasItems={!!afgehandeldeBezwaren?.length}
        isLoading={isLoading(BEZWAREN)}
        className={styles.SectionCollapsibleFirst}
      >
        <Table
          className={styles.DocumentsTable}
          displayProps={DISPLAY_PROPS_BEZWAREN}
          items={afgehandeldeBezwaren}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
