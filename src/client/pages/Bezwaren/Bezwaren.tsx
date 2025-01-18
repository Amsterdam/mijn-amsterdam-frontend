import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import styles from './Bezwaren.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  ErrorAlert,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';

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
    <OverviewPageV2>
      <PageContentV2 className="ams-mb--xl">
        <PageHeadingV2 backLink={AppRoutes.HOME}>Bezwaren</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb--sm">
            Hier ziet u een overzicht van uw ingediende bezwaren.
          </Paragraph>
          <LinkList>
            <LinkList.Link href="https://www.amsterdam.nl/veelgevraagd/bezwaar-maken-tegen-een-besluit-van-de-gemeente-amsterdam-e5898">
              Meer informatie over Bezwaar maken
            </LinkList.Link>
          </LinkList>
          {isError(BEZWAREN) && (
            <ErrorAlert>
              We kunnen op dit moment geen bezwaren tonen.
            </ErrorAlert>
          )}
        </PageContentCell>
      </PageContentV2>
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
        noItemsMessage="U heeft nog geen afgehandelde bezwaren."
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
    </OverviewPageV2>
  );
}
