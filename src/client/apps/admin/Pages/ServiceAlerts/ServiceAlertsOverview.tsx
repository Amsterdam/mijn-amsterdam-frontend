import type { ReactNode } from 'react';

import { StandaloneLink } from '@amsterdam/design-system-react';

import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { defaultDateTimeFormat } from '../../../../../universal/helpers/date.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ThemaPaginaDataView } from '../../../../components/Thema/ThemaPaginaDataView.tsx';
import {
  getServiceAlertDisplayLocationLabel,
  getServiceAlertGroups,
  getServiceAlertTypeLabel,
} from './ServiceAlerts.helpers.ts';
import {
  displayProps,
  routePathToevoegen,
  TEXT_NO_CONTENT,
  TITLE_ADD_STORINGSMELDING_LINK,
} from './ServiceAlerts-thema-config.ts';

export type ServiceAlertOverviewItem = Pick<
  ServiceAlertsOverview[number],
  'title' | 'dateStart' | 'dateEnd'
> & {
  id: string;
  type: ReturnType<typeof getServiceAlertTypeLabel>;
  displayLocation: ReturnType<typeof getServiceAlertDisplayLocationLabel>;
  detailLinkComponent?: ReactNode;
};

function ServiceAlertsTable({
  overview,
  detailPath,
  caption,
}: {
  overview: ServiceAlertsOverview;
  detailPath: string;
  caption: string;
}) {
  const items: ServiceAlertOverviewItem[] = overview.map((serviceAlert) => ({
    id: serviceAlert.id,
    title: serviceAlert.title,
    detailLinkComponent: (
      <MaRouterLink
        href={`${detailPath}/${serviceAlert.id}`}
        maVariant="fatNoUnderline"
      >
        {serviceAlert.title}
      </MaRouterLink>
    ),
    type: getServiceAlertTypeLabel(serviceAlert.type),
    displayLocation: getServiceAlertDisplayLocationLabel(
      serviceAlert.displayLocation,
      serviceAlert.themaId
    ),
    dateStart: defaultDateTimeFormat(serviceAlert.dateStart),
    dateEnd: defaultDateTimeFormat(serviceAlert.dateEnd),
  }));

  return (
    <ThemaPaginaDataView<ServiceAlertOverviewItem>
      zaken={items}
      title={caption}
      textNoContent={TEXT_NO_CONTENT}
      displayProps={displayProps}
    />
  );
}

export function ServiceAlertsPageContent({
  overview,
  detailPath,
}: {
  overview: ServiceAlertsOverview;
  detailPath: string;
}) {
  const { active, upcoming, past } = getServiceAlertGroups(overview);

  return (
    <>
      <PageContentCell>
        <StandaloneLink href={routePathToevoegen} linkComponent={MaRouterLink}>
          {TITLE_ADD_STORINGSMELDING_LINK}
        </StandaloneLink>
      </PageContentCell>
      <ServiceAlertsTable
        overview={active}
        detailPath={detailPath}
        caption="Actief"
      />
      <ServiceAlertsTable
        overview={upcoming}
        detailPath={detailPath}
        caption="Binnenkort"
      />
      <ServiceAlertsTable
        overview={past}
        detailPath={detailPath}
        caption="Afgelopen"
      />
    </>
  );
}
