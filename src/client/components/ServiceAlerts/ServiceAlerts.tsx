import { StandaloneLink } from '@amsterdam/design-system-react';

import type { ServiceAlertsOverview } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { defaultDateTimeFormat } from '../../../universal/helpers/date.ts';
import { DataView } from '../DataView/DataView.tsx';
import { MaLinkLikeButton } from '../MaLink/MaLink.tsx';
import { PageContentCell } from '../Page/Page.tsx';

export type ServiceAlertOverviewItem = Pick<
  ServiceAlertsOverview[number],
  'title' | 'type' | 'displayLocation' | 'dateStart' | 'dateEnd'
>;

function ServiceAlertsTable({ overview }: { overview: ServiceAlertsOverview }) {
  const items: ServiceAlertOverviewItem[] = overview.map((serviceAlert) => {
    return {
      title: serviceAlert.title,
      type: serviceAlert.type,
      displayLocation: serviceAlert.displayLocation,
      dateStart: defaultDateTimeFormat(serviceAlert.dateStart),
      dateEnd: defaultDateTimeFormat(serviceAlert.dateEnd ?? '') ?? null,
    };
  });

  return (
    <DataView<ServiceAlertOverviewItem>
      items={items}
      displayProps={{
        props: {
          title: 'Titel',
          type: 'Type',
          displayLocation: 'Locatie',
          dateStart: 'Startdatum',
          dateEnd: 'Einddatum',
        },
        enableMobileListView: true,
      }}
    />
  );
}

export function ServiceAlertsPageContent({
  overview,
}: {
  overview: ServiceAlertsOverview;
}) {
  return (
    <PageContentCell>
      <MaLinkLikeButton />
      <ServiceAlertsTable overview={overview} />
    </PageContentCell>
  );
}
