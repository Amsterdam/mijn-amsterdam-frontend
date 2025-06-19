import { useEffect } from 'react';

import { Paragraph, Page, SkipLink } from '@amsterdam/design-system-react';
import { PiwikProvider, usePiwik } from '@amsterdam/piwik-tracker-react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import { RecoilRoot } from 'recoil';

import styles from './App.module.scss';
import { PrivateRoutes, PublicRoutes } from './App.routes';
import { AutoLogoutDialog } from './components/AutoLogoutDialog/AutoLogoutDialog';
import { ErrorMessages } from './components/ErrorMessages/ErrorMessages';
import { MainFooter } from './components/MainFooter/MainFooter';
import { MainHeader } from './components/MainHeader/MainHeader';
import { routeConfig as buurtRouteConfig } from './components/MyArea/MyArea-thema-config';
import { loginUrlByAuthMethod } from './config/api';
import { useMonitoring } from './helpers/monitoring';
import { useAnalytics } from './hooks/analytics.hook';
import { useSessionApi } from './hooks/api/useSessionApi';
import { useAppStateRemote } from './hooks/useAppState';
import {
  clearDeeplinkEntry,
  useDeeplinkRedirect,
  useSetDeeplinkEntry,
} from './hooks/useDeeplink.hook';
import { useProfileTypeValue } from './hooks/useProfileType';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useTrackThemas } from './hooks/useTrackThemas.hook';
import { useUsabilla } from './hooks/useUsabilla';

function AppNotAuthenticated() {
  useSetDeeplinkEntry(['sso', 'authMethod']);
  useUsabilla();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Note: see MIJN-5785
  const hasSSO = params.get('sso');
  const authMethod = params.get('authMethod');
  const shouldRedirectSSO =
    hasSSO && authMethod && authMethod in loginUrlByAuthMethod;

  // NOTE: Instantly redirecting users client side may lead to suboptimal UX. See also: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#sect2 and https://en.wikipedia.org/wiki/Meta_refresh
  useEffect(() => {
    if (shouldRedirectSSO) {
      window.location.href = loginUrlByAuthMethod[authMethod];
    }
  }, [shouldRedirectSSO, authMethod]);

  if (shouldRedirectSSO) {
    return (
      <Paragraph className={styles.PreLoader}>
        Automatische toegang tot Mijn Amsterdam wordt gecontroleerd...
      </Paragraph>
    );
  }
  return (
    <>
      <MainHeader isAuthenticated={false} />
      <Page className={styles.App}>
        <PublicRoutes />
      </Page>
      <MainFooter />
    </>
  );
}

function AppAuthenticated() {
  useAppStateRemote();
  useTrackThemas();

  const navigate = useNavigate();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  useUsabilla(profileType);

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      clearDeeplinkEntry();
      navigate(redirectAfterLogin);
    }
  }, [redirectAfterLogin]);

  const isBuurt = location.pathname === buurtRouteConfig.themaPage.path;

  return (
    <>
      <SkipLink href="#skip-to-id-AppContent">Direct naar inhoud</SkipLink>
      <MainHeader isAuthenticated />
      <ErrorMessages />
      <main>
        <Page className={!isBuurt ? styles.App : styles.AppWide}>
          <PrivateRoutes />
        </Page>
      </main>
      {/** Remove the footer on the Map view for better UX */}
      {!isBuurt && <MainFooter />}
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
  const { isPristine, isAuthenticated } = session;

  useScrollToTop();

  // If session was previously authenticated we don't want to show the loader again
  if (isPristine) {
    return (
      <Paragraph className={styles.PreLoader}>
        Welkom op Mijn Amsterdam
      </Paragraph>
    );
  }

  return isAuthenticated ? (
    <>
      <AppAuthenticated />
      {!!session.expiresAtMilliseconds && (
        <AutoLogoutDialog
          expiresAtMilliseconds={session.expiresAtMilliseconds}
        />
      )}
    </>
  ) : (
    <AppNotAuthenticated />
  );
}

export function App() {
  const { enableLinkTracking } = usePiwik();
  enableLinkTracking();

  return (
    <RecoilRoot>
      <BrowserRouter>
        <AppLanding />
      </BrowserRouter>
    </RecoilRoot>
  );
}

export function AppWrapper() {
  /**
   * Visitor analytics and support
   */
  const piwikInstance = useAnalytics(!!import.meta.env.REACT_APP_ANALYTICS_ID);
  useMonitoring();

  return (
    <PiwikProvider value={piwikInstance}>
      <App />
    </PiwikProvider>
  );
}
