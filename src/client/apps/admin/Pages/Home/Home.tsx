import { Paragraph } from '@amsterdam/design-system-react';

import type { AdminIndexLocals } from '../../../../../server/services/admin/admin-types.ts';
import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import {
  sendJSONPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import {
  type SessionData,
  useSessionApiData,
} from '../../../../hooks/api/useSessionApi.ts';
import { AUTH_API_URL, BFFApiUrls } from '../../config/api.ts';
import { themaConfig } from './Home-thema-config.ts';

function useIndexPageApi() {
  return useBffApi<AdminIndexLocals>(BFFApiUrls.INDEX);
}

function useIndexPageData() {
  const { isLoading, isError, data } = useIndexPageApi();
  return {
    title: themaConfig.title,
    isLoading,
    isError,
    links: data?.content?.links ?? [],
  };
}

export function Home() {
  const { title, isError, isLoading } = useIndexPageData();
  const sessionData = useSessionApiData<
    SessionData & { username: string | null }
  >(AUTH_API_URL);
  const addServiceAlerts = useBffApi<{ success: boolean }, ServiceAlertInput>(
    BFFApiUrls.SERVICE_ALERTS_UPSERT,
    {
      fetchImmediately: false,
      sendRequest: sendJSONPostRequest,
    }
  );
  const serviceAlerts = useBffApi(BFFApiUrls.SERVICE_ALERTS_OVERVIEW);
  console.log('Service alerts:', serviceAlerts.data?.content);

  const pageContentMain = (
    <PageContentCell>
      Hoi! Je bent ingelogd met{' '}
      {sessionData?.username ?? 'een onbekend emailadres'}.
      <button
        disabled={addServiceAlerts.isLoading}
        onClick={() =>
          addServiceAlerts.fetch({
            method: 'POST',
            payload: {
              title: 'Test service alert',
              body: 'Dit is een voorbeeldmelding om het aanmaken te testen.',
              type: 'info',
              displayLocation: 'dashboard',
              links: [],
              environments: ['test'],
              dateStart: new Date().toISOString(),
              dateEnd: null,
            },
          })
        }
      >
        Aanmaken storingsmelding
      </button>
      {addServiceAlerts.isLoading && <p>Service alert wordt aangemaakt...</p>}
      {addServiceAlerts.isError && (
        <p role="alert">Aanmaken mislukt: {addServiceAlerts.errorData}</p>
      )}
      {addServiceAlerts.data?.status === 'OK' && (
        <p>Service alert aangemaakt.</p>
      )}
    </PageContentCell>
  );

  return (
    <ThemaPagina
      title={title}
      showBreadcrumbs={false}
      isError={isError}
      isLoading={isLoading}
      id="admin-home"
      pageContentTop={null}
      pageContentMain={pageContentMain}
      pageLinks={[]}
    />
  );
}

export function HomePublic() {
  return (
    <PageV2 heading={themaConfig.title} showBreadcrumbs={false}>
      <PageContentCell>
        <Paragraph>U bent niet ingelogd.</Paragraph>
      </PageContentCell>
    </PageV2>
  );
}
