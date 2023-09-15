import {
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
import { defaultDateFormat, isLoading } from '../../../universal/helpers';
import { AppRoutes } from '../../../universal/config';

const DISPLAY_PROPS_BEZWAREN_LOPEND = {
  identificatie: 'Zaaknummer',
  registratiedatum: 'Ontvangen op',
  omschrijving: 'Onderwerp',
};

const DISPLAY_PROPS_BEZWAREN_AFGEROND = {
  identificatie: 'Zaaknummer',
  datumbesluit: 'Datum besluit',
  omschrijving: 'Onderwerp',
};

export default function BEZWAREN() {
  const { BEZWAREN } = useAppStateGetter();

  const items = addTitleLinkComponent(
    BEZWAREN.content ?? [],
    'identificatie'
  ).map((bezwaar) => ({
    ...bezwaar,
    registratiedatum: defaultDateFormat(bezwaar.registratiedatum),
  }));

  const ingediendeBezwaren =
    items.filter((bezwaar) => !bezwaar.einddatum || !bezwaar.resultaat) ?? [];
  const afgehandeldeBezwaren =
    items.filter((bezwaar) => !!bezwaar.einddatum && !!bezwaar.resultaat) ?? [];

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
            href="https://www.amsterdam.nl/belastingen-heffingen/bezwaar-maken/"
          >
            Meer informatie over Bezwaar maken
          </Linkd>
        </p>
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
          displayProps={DISPLAY_PROPS_BEZWAREN_LOPEND}
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
          displayProps={DISPLAY_PROPS_BEZWAREN_AFGEROND}
          items={afgehandeldeBezwaren}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
