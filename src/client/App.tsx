import { useEffect } from 'react';

import { Paragraph, Page, SkipLink } from '@amsterdam/design-system-react';
import { PiwikProvider, usePiwik } from '@amsterdam/piwik-tracker-react';
import classNames from 'classnames';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';

import styles from './App.module.scss';
import { PrivateRoutes, PublicRoutes } from './App.routes.tsx';
import { CobrowseScreenshareAlert } from './components/Alert/CobrowseScreenshareDisclaimer.tsx';
import { AutoLogoutDialog } from './components/AutoLogoutDialog/AutoLogoutDialog.tsx';
import { ErrorMessages } from './components/ErrorMessages/ErrorMessages.tsx';
import { MainFooter } from './components/MainFooter/MainFooter.tsx';
import { MainHeader } from './components/MainHeader/MainHeader.tsx';
import { routeConfig as buurtRouteConfig } from './components/MyArea/MyArea-thema-config.ts';
import { loginUrlByAuthMethod } from './config/api.ts';
import { useCobrowseScreenshareState } from './helpers/cobrowse.ts';
import { useMonitoring } from './helpers/monitoring.ts';
import { useAnalytics } from './hooks/analytics.hook.ts';
import { useSessionApi } from './hooks/api/useSessionApi.ts';
import { useAppStateRemote } from './hooks/useAppStateRemote.ts';
import {
  clearDeeplinkEntry,
  useDeeplinkRedirect,
  useSetDeeplinkEntry,
} from './hooks/useDeeplink.hook.ts';
import { useScrollToTop } from './hooks/useScrollToTop.ts';
import { useTrackThemas } from './hooks/useTrackThemas.hook.ts';

function AppNotAuthenticated() {
  useSetDeeplinkEntry(['sso', 'authMethod']);

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
      <Page className={styles.App}>
        <MainHeader isAuthenticated={false} />
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
  const redirectAfterLogin = useDeeplinkRedirect();
  const isScreensharing = useCobrowseScreenshareState();

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      clearDeeplinkEntry();
      navigate(redirectAfterLogin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectAfterLogin]);

  const isBuurt = location.pathname === buurtRouteConfig.themaPage.path;

  return (
    <>
      <Page
        className={classNames(
          styles.App,
          isBuurt ? styles.AppWide : '',
          isScreensharing ? 'is-cobrowse-active' : ''
        )}
      >
        <SkipLink href="#page-main-content">Direct naar inhoud</SkipLink>
        <MainHeader isAuthenticated />
        <ErrorMessages />
        {isScreensharing && <CobrowseScreenshareAlert />}
        <PrivateRoutes />
      </Page>
      {/** Remove the footer on the Map view for better UX */}
      {!isBuurt && <MainFooter id="page-main-footer" />}
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
  const { isAuthenticated, isDirty } = session;

  useScrollToTop();

  // We don't want to show the app content until we know whether the user is authenticated or not,
  // to prevent flashing of the wrong content.
  // Therefore, we return null while the session is still loading (dirty).
  if (!isDirty) {
    return null;
  }
  const welcomeLoader = document.getElementById('loader');
  if (welcomeLoader) {
    welcomeLoader.remove();
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
    <BrowserRouter>
      <AppLanding />
    </BrowserRouter>
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
