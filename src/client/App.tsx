import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  BrowserRouter,
  matchPath,
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
import MyAreaLoader from './components/MyArea/MyAreaLoader';
import {
  TMA_LOGIN_URL_DIGID_AFTER_REDIRECT,
  TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT,
} from './config/api';
import { useAnalytics, usePageChange, useScript } from './hooks';
import { useSessionApi } from './hooks/api/useSessionApi';
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
import StadspasDetail from './pages/StadspasDetail/StadspasDetail';

function AppNotAuthenticated() {
  useDeeplinkEntry();

  return (
    <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
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
  );
}

function AppAuthenticated() {
  useAppState();
  useTipsApi();
  usePageChange();

  const location = useLocation();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  return matchPath(location.pathname, { path: AppRoutes.BUURT }) ? (
    <Switch>
      <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
    </Switch>
  ) : (
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
          path={AppRoutes['INKOMEN/STADSPAS/AANVRAAG']}
          component={InkomenDetail}
        />
        {FeatureToggle.stadpasActive && (
          <Route
            path={AppRoutes['INKOMEN/STADSPAS/SALDO']}
            component={StadspasDetail}
          />
        )}
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
        <Route path={AppRoutes['ZORG/VOORZIENINGEN']} component={ZorgDetail} />
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

  return (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      {isAuthenticated ? (
        <>
          <AppAuthenticated />
          <AutoLogoutDialog settings={dialogTimeoutSettings} />
        </>
      ) : (
        <AppNotAuthenticated />
      )}
      <MainFooter />
    </>
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
