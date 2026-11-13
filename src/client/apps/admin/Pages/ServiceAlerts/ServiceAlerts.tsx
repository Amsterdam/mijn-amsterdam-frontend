import { useParams } from 'react-router';

import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { ServiceAlertForm } from './ServiceAlertForm.tsx';
import {
  routePath,
  TITLE_ADD_STORINGSMELDING,
  themaConfig,
} from './ServiceAlerts-thema-config.ts';
import { ServiceAlertsPageContent } from './ServiceAlertsOverview.tsx';

export function ServiceAlerts() {
  const { isError, data } = useBffApi<ServiceAlertsOverview>(
    BFFApiUrls.SERVICE_ALERTS_OVERVIEW
  );

  if (isError) {
    return null;
  }

  return (
    <ThemaPagina
      title={themaConfig.title}
      showBreadcrumbs={false}
      isError={false}
      isLoading={false}
      id="admin-user-feedback"
      pageContentTop={<></>}
      pageLinks={[]}
      pageContentMain={
        <ServiceAlertsPageContent
          overview={data?.content ?? []}
          detailPath={routePath}
        />
      }
    />
  );
}

export function ServiceAlertToevoegen() {
  return (
    <ThemaPagina
      title={TITLE_ADD_STORINGSMELDING}
      showBreadcrumbs={false}
      isError={false}
      isLoading={false}
      id="admin-user-feedback"
      pageContentTop={false}
      pageLinks={[]}
      pageContentMain={<ServiceAlertForm />}
    />
  );
}

export function ServiceAlertDetail() {
  const { id } = useParams<{ id: string }>();
  const { isError, isLoading, data } = useBffApi<ServiceAlertsOverview>(
    BFFApiUrls.SERVICE_ALERTS_OVERVIEW
  );
  const serviceAlert = data?.content?.find((item) => item.id === id);
  const isNotFound = !isLoading && !isError && !serviceAlert;

  return (
    <ThemaPagina
      title={serviceAlert?.title ?? 'Storingsmelding'}
      showBreadcrumbs={false}
      isError={isError || isNotFound}
      errorAlertContent={
        isNotFound ? 'Deze storingsmelding is niet gevonden.' : undefined
      }
      isLoading={isLoading}
      id="admin-service-alert-detail"
      pageContentTop
      pageLinks={[]}
      pageContentMain={
        serviceAlert ? (
          <ServiceAlertForm serviceAlert={serviceAlert} readOnly />
        ) : null
      }
    />
  );
}
