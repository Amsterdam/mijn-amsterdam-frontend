import { useEffect } from 'react';

import { Grid, PageHeader } from '@amsterdam/design-system-react';
import { BrowserRouter } from 'react-router';

import { PrivateRoutes, PublicRoutes } from './App.routes.tsx';
import { AppTabs } from './AppTabs.tsx';
import { AUTH_API_URL, LOGIN_URL, LOGOUT_URL } from './config/api.ts';
import { themaConfig as themaConfigAccount } from './Pages/Account/Account-thema-config.ts';
import { useAccountApi } from './Pages/Account/Account.tsx';
import { MaRouterLink } from '../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../components/Page/Page.tsx';
import { useSessionApi } from '../../hooks/api/useSessionApi.ts';

function AppLanding() {
  const session = useSessionApi(AUTH_API_URL);
  const { isAuthenticated, isDirty } = session;
  const { fetch: fetchAccountData, data: accountData } = useAccountApi();

  useEffect(() => {
    if (isAuthenticated) {
      void fetchAccountData();
    }
  }, [fetchAccountData, isAuthenticated]);

  // We don't want to show the app content until we know whether the user is authenticated or not,
  // to prevent flashing of the wrong content.
  // Therefore, we return null until the session check has completed at least once (isDirty === true).
  if (!isDirty) {
    return null;
  }

  const welcomeLoader = document.getElementById('loader');
  if (welcomeLoader) {
    welcomeLoader.remove();
  }

  return (
    <>
      <PageHeader
        brandName="Mijn Amsterdam - backoffice"
        logoLink="/admin"
        menuItems={
          isAuthenticated ? (
            <>
              <PageHeader.MenuLink
                linkComponent={MaRouterLink}
                fixed
                href={themaConfigAccount.route.path}
              >
                {accountData?.content?.username ?? 'Account'}
              </PageHeader.MenuLink>
              <PageHeader.MenuLink fixed href={LOGOUT_URL}>
                Uitloggen
              </PageHeader.MenuLink>
            </>
          ) : (
            <PageHeader.MenuLink fixed href={LOGIN_URL}>
              Inloggen
            </PageHeader.MenuLink>
          )
        }
      />

      {isAuthenticated ? (
        <>
          <Grid>
            <PageContentCell>
              <AppTabs />
            </PageContentCell>
          </Grid>
          <PrivateRoutes />
        </>
      ) : (
        <PublicRoutes />
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter basename="/admin">
      <AppLanding />
    </BrowserRouter>
  );
}
