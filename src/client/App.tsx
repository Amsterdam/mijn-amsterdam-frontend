import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { AppRoutes, FeatureToggle } from '../universal/config';
import {
  getOtapEnvItem,
  IS_ACCEPTANCE,
  IS_PRODUCTION,
} from '../universal/config/env';
import { isPrivateRoute } from '../universal/helpers';
import styles from './App.module.scss';
import {
  ApplicationError,
  AutoLogoutDialog,
  MainFooter,
  MainHeader,
} from './components';
import { DefaultAutologoutDialogSettings } from './components/AutoLogoutDialog/AutoLogoutDialog';
import { MyArea2Loader } from './components/MyArea/MyArea2loader';
import {
  TMA_LOGIN_URL_DIGID_AFTER_REDIRECT,
  TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT,
} from './config/api';
import { useAnalytics, usePageChange, useScript } from './hooks';
import { useSessionApi, useSessionValue } from './hooks/api/useSessionApi';
import { useTipsApi } from './hooks/api/useTipsApi';
import { useAppState } from './hooks/useAppState';
import {
  useDeeplinkEntry,
  useDeeplinkRedirect,
} from './hooks/useDeeplink.hook';
import { useProfileTypeValue } from './hooks/useProfileType';
import {
  Accessibility,
  Burgerzaken,
  BurgerzakenDetail,
  Dashboard,
  GarbageInformation,
  GeneralInfo,
  Inkomen,
  InkomenDetail,
  InkomenDetailTozo,
  InkomenSpecificaties,
  LandingPage,
  MyArea,
  MyNotifications,
  MyTips,
  NotFound,
  Profile,
  VergunningDetail,
  Vergunningen,
  Zorg,
  ZorgDetail,
} from './pages';
import ProfileCommercial from './pages/Profile/ProfileCommercial';

function AppNotAuthenticated() {
  useDeeplinkEntry();

  return (
    <>
      <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
        <MainHeader />
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={LandingPage} />
          <Route path={AppRoutes.ACCESSIBILITY} component={Accessibility} />
          <Route
            render={({ location: { pathname } }) => {
              if (isPrivateRoute(pathname)) {
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
  useAppState();
  useTipsApi();
  const location = useLocation();
  const session = useSessionValue();
  const profileType = useProfileTypeValue();

  usePageChange();

  const redirectAfterLogin = useDeeplinkRedirect();

  return location.pathname === AppRoutes.BUURT ? (
    FeatureToggle.myArea2Active ? (
      <MyArea2Loader isDashboard={false} />
    ) : (
      <MyArea />
    )
  ) : (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      <div className={styles.App} id="AppContent">
        <Switch>
          <Redirect
            from={TMA_LOGIN_URL_DIGID_AFTER_REDIRECT}
            to={redirectAfterLogin}
          />
          <Redirect
            from={TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT}
            to={redirectAfterLogin}
          />
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Route path={AppRoutes.NOTIFICATIONS} component={MyNotifications} />
          {profileType !== 'private' ? (
            <Redirect from={AppRoutes.BRP} to={AppRoutes.KVK} />
          ) : (
            <Redirect from={AppRoutes.KVK} to={AppRoutes.BRP} />
          )}
          <Route path={AppRoutes.BRP} component={Profile} />
          <Route path={AppRoutes.KVK} component={ProfileCommercial} />
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
          {FeatureToggle.garbageInformationPage && (
            <Route path={AppRoutes.AFVAL} component={GarbageInformation} />
          )}
          <Route path={AppRoutes.ACCESSIBILITY} component={Accessibility} />
          <Route path={AppRoutes.GENERAL_INFO} component={GeneralInfo} />
          <Route
            path={AppRoutes['VERGUNNINGEN/DETAIL']}
            component={VergunningDetail}
          />
          <Route path={AppRoutes.VERGUNNINGEN} component={Vergunningen} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter />
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
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
      <AppAuthenticated />
      <AutoLogoutDialog settings={dialogTimeoutSettings} />
    </>
  ) : (
    <AppNotAuthenticated />
  );
}

export default function App() {
  /**
   * Visitor analytics and support
   */
  useAnalytics(!!getOtapEnvItem('analyticsId'));
  useScript('/js/usabilla.js', false, true, IS_PRODUCTION);
  useScript(
    '//siteimproveanalytics.com/js/siteanalyze_6004851.js',
    false,
    true,
    IS_ACCEPTANCE
  );

  const sendToSentry = (error: Error, info: { componentStack: string }) => {
    Sentry.captureException(error, {
      extra: {
        componentStack: info.componentStack,
      },
    });
  };

  return (
    <RecoilRoot>
      <BrowserRouter>
        <ErrorBoundary
          onError={sendToSentry}
          FallbackComponent={ApplicationError}
        >
          <AppLanding />
        </ErrorBoundary>
      </BrowserRouter>
    </RecoilRoot>
  );
}
