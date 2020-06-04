import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import React, { useContext, useEffect } from 'react';
import ErrorBoundary from 'react-error-boundary';
import {
  BrowserRouter,
  matchPath,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import useRouter from 'use-react-router';
import { AppRoutes, FeatureToggle } from '../universal/config';
import { getOtapEnvItem, IS_PRODUCTION } from '../universal/config/env';
import styles from './App.module.scss';
import AppStateProvider from './AppStateProvider';
import {
  ApplicationError,
  AutoLogoutDialog,
  MainFooter,
  MainHeader,
} from './components';
import { DefaultAutologoutDialogSettings } from './components/AutoLogoutDialog/AutoLogoutDialog';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from './config/api';
import {
  useAnalytics,
  useLocalStorage,
  usePageChange,
  useScript,
} from './hooks';
import {
  Burgerzaken,
  BurgerzakenDetail,
  Dashboard,
  GarbageInformation,
  Inkomen,
  InkomenDetail,
  InkomenDetailTozo,
  InkomenSpecificaties,
  LandingPage,
  MyArea,
  MyNotifications,
  MyTips,
  NotFound,
  Proclaimer,
  Profile,
  Zorg,
  ZorgDetail,
} from './pages';
import { SessionContext, SessionState } from './SessionState';

export const PublicRoutes = [
  AppRoutes.PROCLAIMER,
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
];
export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

function AppNotAuthenticated() {
  const { location } = useRouter();

  const [routeEntry, setRouteEntry] = useLocalStorage('RouteEntry', '');

  if (!routeEntry || (routeEntry === '/' && location.pathname !== '/')) {
    setRouteEntry(location.pathname);
  }

  return (
    <>
      <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
        <MainHeader />
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={LandingPage} />
          <Route path={AppRoutes.PROCLAIMER} component={Proclaimer} />
          <Route
            render={({ location: { pathname } }) => {
              if (
                PrivateRoutes.some(
                  path =>
                    !!matchPath(pathname, {
                      path,
                      exact: true,
                      strict: false,
                    })
                )
              ) {
                // Private routes are redirected to Home
                return <Redirect to={AppRoutes.ROOT} />;
              }
              // All other routes are presented with a 404 page
              return <Route component={NotFound} />;
            }}
          />
        </Switch>
      </div>
      <MainFooter />
    </>
  );
}

function AppAuthenticated() {
  const { location } = useRouter();
  const session = useContext(SessionContext);
  const [routeEntry, setRouteEntry] = useLocalStorage('RouteEntry', '');

  const redirectAfterLogin = routeEntry || AppRoutes.ROOT;

  usePageChange();

  useEffect(() => {
    if (routeEntry) {
      setRouteEntry('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return location.pathname === AppRoutes.BUURT ? (
    <MyArea />
  ) : (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      <div className={styles.App} id="AppContent">
        <Switch>
          <Redirect from={LOGIN_URL_DIGID} to={redirectAfterLogin} />
          <Redirect from={LOGIN_URL_EHERKENNING} to={redirectAfterLogin} />
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Route path={AppRoutes.NOTIFICATIONS} component={MyNotifications} />
          <Route path={AppRoutes.BRP} component={Profile} />
          <Route path={AppRoutes.TIPS} component={MyTips} />
          <Route
            path={AppRoutes['INKOMEN/STADSPAS']}
            component={InkomenDetail}
          />
          <Route
            path={AppRoutes['INKOMEN/BIJSTANDSUITKERING']}
            component={InkomenDetail}
          />
          <Route
            path={AppRoutes['INKOMEN/SPECIFICATIES']}
            component={InkomenSpecificaties}
          />
          <Route
            path={AppRoutes['INKOMEN/BIJZONDERE_BIJSTAND']}
            component={InkomenDetail}
          />
          {FeatureToggle.tozoActive && (
            <Route
              path={AppRoutes['INKOMEN/TOZO']}
              component={InkomenDetailTozo}
            />
          )}
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route
            path={AppRoutes['ZORG/VOORZIENINGEN']}
            component={ZorgDetail}
          />
          <Route path={AppRoutes.ZORG} component={Zorg} />
          <Route
            path={AppRoutes.BURGERZAKEN_DOCUMENT}
            component={BurgerzakenDetail}
          />
          <Route path={AppRoutes.BURGERZAKEN} component={Burgerzaken} />
          <Route path={AppRoutes.PROCLAIMER} component={Proclaimer} />
          {FeatureToggle.garbageInformationPage && (
            <Route path={AppRoutes.AFVAL} component={GarbageInformation} />
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter />
    </>
  );
}

function AppLanding() {
  const session = useContext(SessionContext);

  const { isPristine, isAuthenticated, validityInSeconds } = session;

  // If session was previously authenticated we don't want to show the loader again
  if (isPristine) {
    return <p className={styles.PreLoader}>Welkom bij Mijn Amsterdam</p>;
  }

  const dialogTimeoutSettings = {
    secondsBeforeDialogShow:
      validityInSeconds ||
      DefaultAutologoutDialogSettings.secondsBeforeDialogShow,
  };

  // Render the main app only if we are authenticated
  return isAuthenticated ? (
    <>
      <AppStateProvider>
        <AppAuthenticated />
      </AppStateProvider>
      <AutoLogoutDialog settings={dialogTimeoutSettings} />
    </>
  ) : (
    <AppNotAuthenticated />
  );
}

export default function App() {
  useAnalytics(!!getOtapEnvItem('analyticsId'));
  useScript('/js/usabilla.js', false, true, IS_PRODUCTION);

  const sendToSentry = (error: Error, componentStack: string) => {
    getOtapEnvItem('sentryDsn') && Sentry.captureException(error);
  };

  return (
    <BrowserRouter>
      <ErrorBoundary
        onError={sendToSentry}
        FallbackComponent={ApplicationError}
      >
        <SessionState>
          <AppLanding />
        </SessionState>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
