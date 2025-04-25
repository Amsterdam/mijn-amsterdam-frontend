import { useEffect } from 'react';

import { Paragraph, Screen, SkipLink } from '@amsterdam/design-system-react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import { RecoilRoot } from 'recoil';

import styles from './App.module.scss';
import { PrivateRoutes, PublicRoutes } from './App.routes';
import { AutoLogoutDialog } from './components/AutoLogoutDialog/AutoLogoutDialog';
import { ErrorMessages } from './components/ErrorMessages/ErrorMessages';
import { MainFooter } from './components/MainFooter/MainFooter';
import { MainHeader } from './components/MainHeader/MainHeader';
import { MainHeaderHero } from './components/MainHeaderHero/MainHeaderHero';
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
import { useTrackThemas } from './hooks/useTrackThemas.hook';
import { useUsabilla } from './hooks/useUsabilla';
import { AppRoutes } from '../universal/config/routes';
import { routeConfig as buurtRouteConfig } from './components/MyArea/MyArea-thema-config';

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
      <Screen className={styles.App}>
        <PublicRoutes />
      </Screen>
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

  const isHeroVisible = location.pathname === AppRoutes.HOME;
  const isBuurt = location.pathname === buurtRouteConfig.themaPage.path;

  return (
    <>
      <SkipLink href="#skip-to-id-AppContent">Direct naar inhoud</SkipLink>
      <MainHeader isAuthenticated />
      <ErrorMessages />
      {isHeroVisible && <MainHeaderHero />}
      <Screen className={!isBuurt ? styles.App : styles.AppWide}>
        <PrivateRoutes />
      </Screen>
      {/** Remove the footer on the Map view for better UX */}
      {!isBuurt && <MainFooter isAuthenticated />}
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
  const { isPristine, isAuthenticated } = session;

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
  /**
   * Visitor analytics and support
   */
  useAnalytics(!!import.meta.env.REACT_APP_ANALYTICS_ID);
  useMonitoring();

  return (
    <RecoilRoot>
      <BrowserRouter>
        <AppLanding />
      </BrowserRouter>
    </RecoilRoot>
  );
}
