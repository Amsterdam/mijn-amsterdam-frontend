import * as Sentry from '@sentry/browser';

import { AppRoutes, FeatureToggle, PrivateRoutes } from '../universal/config';
import AppState, { SessionContext, SessionState } from './AppState';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  matchPath,
} from 'react-router-dom';
import {
  IS_ANALYTICS_ENABLED,
  IS_PRODUCTION,
  IS_SENTRY_ENABLED,
} from '../universal/env';
import React, { useContext } from 'react';

import ApplicationError from './components/ApplicationError/ApplicationError';
import AutoLogoutDialog from './components/AutoLogoutDialog/AutoLogoutDialog';
import Dashboard from './pages/Dashboard/Dashboard';
import ErrorBoundary from 'react-error-boundary';
import GarbageInformation from './pages/GarbageInformation/GarbageInformation';
import Inkomen from './pages/Inkomen/Inkomen';
import InkomenDetail from './pages/InkomenDetail/InkomenDetail';
import InkomenSpecificaties from './pages/InkomenSpecificaties/InkomenSpecificaties';
import LandingPage from './pages/Landing/Landing';
import MainFooter from './components/MainFooter/MainFooter';
import MainHeader from './components/MainHeader/MainHeader';
import MyArea from '././pages/MyArea/MyArea';
import MyNotifications from './pages/MyNotifications/MyNotifications';
import MyTips from './pages/MyTips/MyTips';
import NotFound from './pages/NotFound/NotFound';
import Proclaimer from './pages/Proclaimer/Proclaimer';
import Profile from './pages/Profile/Profile';
import Zorg from './pages/Zorg/Zorg';
import ZorgDetail from './pages/ZorgDetail/ZorgDetail';
import classnames from 'classnames';
import styles from './App.module.scss';
import { useAnalytics } from './hooks/analytics.hook';
import usePageChange from './hooks/pageChange';
import useRouter from 'use-react-router';
import useScript from './hooks/useScript';
import Burgerzaken from './pages/Burgerzaken/Burgerzaken';
import BurgerzakenDetail from './pages/BurgerzakenDetail/BurgerzakenDetail';

function AppNotAuthenticated() {
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
                return <Redirect to={AppRoutes.ROOT} />;
              }
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

  usePageChange();

  return location.pathname === AppRoutes.MIJN_BUURT ? (
    <MyArea />
  ) : (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      <div className={styles.App} id="AppContent">
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Redirect from={AppRoutes.API_LOGIN} to={AppRoutes.ROOT} />
          <Route path={AppRoutes.UPDATES} component={MyNotifications} />
          <Route path={AppRoutes.MIJN_GEGEVENS} component={Profile} />
          <Route path={AppRoutes.MIJN_TIPS} component={MyTips} />
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
