import { Paragraph } from '@amsterdam/design-system-react';

import styles from './Horeca.module.scss';
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
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS_HORECA = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequest: 'Aangevraagd',
};

const DISPLAY_PROPS_HORECA_EERDER = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  decision: 'Resultaat',
};

export const HORECA_PAGE_SIZE = 20;

export default function Horeca() {
  const { HORECA } = useAppStateGetter();

  const vergunningen =
    HORECA.content?.map((v) => {
      return {
        ...v,
        dateRequest: defaultDateFormat(v.dateRequest),
      };
    }) || [];

  const items = addTitleLinkComponent(vergunningen, 'identifier');

  const lopendeVergunningen = items.filter((v) => !v.processed);
  const afgerondeVergunningen = items.filter((v) => v.processed);

  return (
    <OverviewPageV2 className={styles.Horeca}>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {ThemaTitles.HORECA}
        </PageHeadingV2>
        <PageContentCell spanWide={6}>
          <Paragraph className="ams-mb--xl">
            Hier ziet u een overzicht van uw aanvragen voor Horeca en
            ontheffingen bij gemeente Amsterdam.
          </Paragraph>
          {isError(HORECA) && (
            <ErrorAlert>
              We kunnen op dit moment geen vergunningen tonen.
            </ErrorAlert>
          )}
        </PageContentCell>
      </PageContentV2>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Lopende aanvragen"
        noItemsMessage="U heeft geen horeca vergunningen in aanvraag."
        startCollapsed={false}
        hasItems={!!lopendeVergunningen?.length}
        isLoading={isLoading(HORECA)}
        className=""
      >
        <Table
          items={lopendeVergunningen}
          displayProps={DISPLAY_PROPS_HORECA}
          titleKey="identifier"
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Eerdere aanvragen"
        noItemsMessage="U heeft nog geen toegekende horeca vergunningen."
        startCollapsed={false}
        hasItems={!!afgerondeVergunningen?.length}
        isLoading={isLoading(HORECA)}
        className=""
      >
        <Table
          items={afgerondeVergunningen}
          displayProps={DISPLAY_PROPS_HORECA_EERDER}
          titleKey="identifier"
        />
      </SectionCollapsible>
    </OverviewPageV2>
  );
}
