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
import { isLoading } from '../../../universal/helpers';
import { AppRoutes } from '../../../universal/config';

const DISPLAY_PROPS_BEZWAREN_LOPEND = {
  zaakkenmerk: 'Nummer',
  ontvangstdatum: 'Ontvangstdatum',
};

const DISPLAY_PROPS_BEZWAREN_AFGEROND = {
  zaakkenmerk: 'Nummer',
  datumbesluit: 'Datum besluit',
};

export default function BEZWAREN() {
  const { BEZWAREN } = useAppStateGetter();

  const items = addTitleLinkComponent(BEZWAREN.content ?? [], 'bezwaarnummer');
  const ingediendeBezwaren =
    items.filter((bezwaar) => bezwaar.einddatum === null) ?? [];
  const afgehandeldeBezwaren =
    items.filter((bezwaar) => bezwaar.einddatum !== null) ?? [];

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

        <SectionCollapsible
          id="SectionCollapsible-complaints"
          title="Ingediende bezwaren"
          noItemsMessage="U heeft nog geen bezwaren ingediend."
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
          noItemsMessage="U heeft nog geen afgehandelde bezwaren."
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
      </PageContent>
    </OverviewPage>
  );
}
