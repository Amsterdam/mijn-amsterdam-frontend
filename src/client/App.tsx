import { useEffect } from 'react';

import { Paragraph, Page, SkipLink } from '@amsterdam/design-system-react';
import { PiwikProvider, usePiwik } from '@amsterdam/piwik-tracker-react';
import classNames from 'classnames';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';

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
import { useAppStateRemote } from './hooks/useAppStateRemote';
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
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  useUsabilla(profileType);

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
      <Page className={classNames(styles.App, isBuurt ? styles.AppWide : '')}>
        <SkipLink href="#page-main-content">Direct naar inhoud</SkipLink>
        <MainHeader isAuthenticated />
        <ErrorMessages />
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

  // If session was previously authenticated we don't want to show the loader again
  if (!isDirty) {
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
