import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import ApplicationError from 'components/ApplicationError/ApplicationError';
import AutoLogoutDialog from 'components/AutoLogoutDialog/AutoLogoutDialog';
import { useAnalytics } from 'hooks/analytics.hook';
import usePageChange from 'hooks/pageChange';
import useScript from 'hooks/useScript';
import Dashboard from 'pages/Dashboard/Dashboard';
import GarbageInformation from 'pages/GarbageInformation/GarbageInformation';
import Inkomen from 'pages/Inkomen/Inkomen';
import InkomenDetail from 'pages/InkomenDetail/InkomenDetail';
import InkomenSpecificaties from 'pages/InkomenSpecificaties/InkomenSpecificaties';
import LandingPage from 'pages/Landing/Landing';
import MyNotifications from 'pages/MyNotifications/MyNotifications';
import MyTips from 'pages/MyTips/MyTips';
import Proclaimer from 'pages/Proclaimer/Proclaimer';
import Zorg from 'pages/Zorg/Zorg';
import ZorgDetail from 'pages/ZorgDetail/ZorgDetail';
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
import styles from './App.module.scss';
import AppState, { SessionContext, SessionState } from './AppState';
import MainFooter from './components/MainFooter/MainFooter';
import MainHeader from './components/MainHeader/MainHeader';
import { FeatureToggle } from './config/App.constants';
import { AppRoutes, PrivateRoutes } from './config/Routing.constants';
import { IS_ANALYTICS_ENABLED, IS_PRODUCTION, IS_SENTRY_ENABLED } from './env';
import { useLocalStorage } from './hooks/storage.hook';
import Burgerzaken from './pages/Burgerzaken/Burgerzaken';
import BurgerzakenDetail from './pages/BurgerzakenDetail/BurgerzakenDetail';
import MyArea from './pages/MyArea/MyArea';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';

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
  const [routeEntry, setRouteEntry] = useLocalStorage('RouteEntry');

  const redirectAfterLogin = routeEntry || AppRoutes.ROOT;

  usePageChange();

  useEffect(() => {
    if (routeEntry) {
      setRouteEntry('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return location.pathname === AppRoutes.MIJN_BUURT ? (
    <MyArea />
  ) : (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      <div className={styles.App} id="AppContent">
        <Switch>
          <Redirect from={AppRoutes.API_LOGIN} to={redirectAfterLogin} />
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Route path={AppRoutes.UPDATES} component={MyNotifications} />
          <Route path={AppRoutes.MIJN_GEGEVENS} component={Profile} />
          <Route path={AppRoutes.MIJN_TIPS} component={MyTips} />
          <Route
            path={AppRoutes['INKOMEN/TOZO_COVID19']}
            component={InkomenDetail}
          />
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
    secondsBeforeDialogShow: validityInSeconds,
  };

  // Render the main app only if we are authenticated
  return isAuthenticated ? (
    <>
      <AppState>
        <AppAuthenticated />
      </AppState>
      <AutoLogoutDialog settings={dialogTimeoutSettings} />
    </>
  ) : (
    <AppNotAuthenticated />
  );
}

export default function App() {
  useAnalytics(IS_ANALYTICS_ENABLED);
  useScript('/js/usabilla.js', false, true, IS_PRODUCTION);

  const sendToSentry = (error: Error, componentStack: string) => {
    IS_SENTRY_ENABLED && Sentry.captureException(error);
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
