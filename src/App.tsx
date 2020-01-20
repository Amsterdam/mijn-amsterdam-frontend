import AutoLogoutDialog from 'components/AutoLogoutDialog/AutoLogoutDialog';
import usePageChange from 'hooks/pageChange';
import { useAnalytics } from 'hooks/analytics.hook';
import Dashboard from 'pages/Dashboard/Dashboard';
import Inkomen from 'pages/Inkomen/Inkomen';
import InkomenDetail from 'pages/InkomenDetail/InkomenDetail';
import LandingPage from 'pages/Landing/Landing';
import MyArea from 'pages/MyArea/MyArea';
import MyTips from 'pages/MyTips/MyTips';
import MyNotifications from 'pages/MyNotifications/MyNotifications';
import Proclaimer from 'pages/Proclaimer/Proclaimer';
import Zorg from 'pages/Zorg/Zorg';
import ZorgDetail from 'pages/ZorgDetail/ZorgDetail';
import React, { useContext } from 'react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  matchPath,
} from 'react-router-dom';
import useRouter from 'use-react-router';
import ErrorBoundary from 'react-error-boundary';
import { AppRoutes, FeatureToggle, PrivateRoutes } from './config/App.constants';
import styles from './App.module.scss';
import AppState, { SessionContext, SessionState } from './AppState';
import MainFooter from './components/MainFooter/MainFooter';
import MainHeader from './components/MainHeader/MainHeader';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';
import classnames from 'classnames';
import * as Sentry from '@sentry/browser';
import ApplicationError from 'components/ApplicationError/ApplicationError';
import useScript from 'hooks/useScript';
import { isProduction } from './helpers/App';
import GarbageInformation from 'pages/GarbageInformation/GarbageInformation';
import { isAnalyticsEnabled, isSentryEnabled } from './env';

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
          <Route path={AppRoutes.MELDINGEN} component={MyNotifications} />
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
            path={AppRoutes['INKOMEN/BIJZONDERE_BIJSTAND']}
            component={InkomenDetail}
          />
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route
            path={AppRoutes['ZORG/VOORZIENINGEN']}
            component={ZorgDetail}
          />
          <Route path={AppRoutes.ZORG} component={Zorg} />
          <Route path={AppRoutes.MIJN_BUURT} component={MyArea} />
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
  useAnalytics(isAnalyticsEnabled);
  useScript('/js/usabilla.js', false, true, isProduction());

  const sendToSentry = (error: Error, componentStack: string) => {
    isSentryEnabled && Sentry.captureException(error);
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
