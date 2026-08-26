import { Paragraph } from '@amsterdam/design-system-react';

import { themaConfig } from './Home-thema-config.ts';
import type { AdminIndexLocals } from '../../../../../server/services/admin/admin-types.ts';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import {
  useSessionApiData,
  type SessionData,
} from '../../../../hooks/api/useSessionApi.ts';
import { AUTH_API_URL, BFFApiUrls } from '../../config/api.ts';

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

  const pageContentMain = (
    <PageContentCell>
      Hoi! Je bent ingelogd met{' '}
      {sessionData?.username ?? 'een onbekend emailadres'}.
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
