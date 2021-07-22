import * as Sentry from '@sentry/react';
import classnames from 'classnames';
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
import { getOtapEnvItem, IS_AP } from '../universal/config/env';
import { AppRoutesRedirect } from '../universal/config/routes';
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
  TMA_LOGIN_URL_IRMA_AFTER_REDIRECT,
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
  BurgerzakenIDKaart,
  Dashboard,
  GarbageInformation,
  GeneralInfo,
  Inkomen,
  InkomenDetailTonk,
  InkomenDetailTozo,
  InkomenDetailUitkering,
  InkomenSpecificaties,
  LandingPage,
  MyNotifications,
  MyTips,
  NotFound,
  Profile,
  ToeristischeVerhuur,
  ToeristischeVerhuurDetail,
  VergunningDetail,
  Vergunningen,
  Zorg,
  ZorgDetail,
} from './pages';
import BurgerzakenAkte from './pages/BurgerzakenDetail/BurgerzakenAkte';
import ProfileCommercial from './pages/Profile/ProfileCommercial';
import Stadspas from './pages/Stadspas/Stadspas';
import StadspasAanvraagDetail from './pages/StadspasDetail/StadspasAanvraagDetail';
import StadspasDetail from './pages/StadspasDetail/StadspasDetail';
import { useUsabilla } from './hooks/useUsabilla';
import Search from './pages/Search/Search';

function AppNotAuthenticated() {
  useDeeplinkEntry();

  return (
    <>
      <MainHeader isAuthenticated={false} />
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
      <MainFooter isAuthenticated={false} />
    </>
  );
}

function AppAuthenticated() {
  useAppState();
  useTipsApi();
  usePageChange();

  const location = useLocation();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  const [pathname, search] = redirectAfterLogin.split('?');

  return matchPath(location.pathname, { path: AppRoutes.BUURT }) ? (
    <Switch>
      <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
    </Switch>
  ) : (
    <>
      <MainHeader isAuthenticated={true} />
      <div className={styles.App} id="skip-to-id-AppContent">
        <Switch>
          <Redirect
            from={TMA_LOGIN_URL_DIGID_AFTER_REDIRECT}
            to={{ pathname, search }}
          />
          <Redirect
            from={TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT}
            to={{ pathname, search }}
          />
          <Redirect
            from={TMA_LOGIN_URL_IRMA_AFTER_REDIRECT}
            to={{ pathname, search }}
          />
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
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
            path={AppRoutes['STADSPAS/AANVRAAG']}
            component={StadspasAanvraagDetail}
          />
          <Route
            path={AppRoutes['STADSPAS/SALDO']}
            component={StadspasDetail}
          />
          <Route
            path={AppRoutes['INKOMEN/BIJSTANDSUITKERING']}
            component={InkomenDetailUitkering}
          />
          <Route
            path={AppRoutes['INKOMEN/SPECIFICATIES']}
            component={InkomenSpecificaties}
          />
          <Route
            path={AppRoutes['INKOMEN/TOZO']}
            component={InkomenDetailTozo}
          />
          <Route
            path={AppRoutes['INKOMEN/TONK']}
            component={InkomenDetailTonk}
          />
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route path={AppRoutes.STADSPAS} component={Stadspas} />
          <Route
            path={AppRoutes['ZORG/VOORZIENINGEN']}
            component={ZorgDetail}
          />
          <Route path={AppRoutes.ZORG} component={Zorg} />
          <Route
            path={AppRoutes['BURGERZAKEN/ID-KAART']}
            component={BurgerzakenIDKaart}
          />
          <Route
            path={AppRoutes['BURGERZAKEN/AKTE']}
            component={BurgerzakenAkte}
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
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={[
                AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'],
                AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'],
                AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'],
                AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
              ]}
              component={ToeristischeVerhuurDetail}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes.TOERISTISCHE_VERHUUR}
              component={ToeristischeVerhuur}
            />
          )}
          <Route path={AppRoutes.SEARCH} component={Search} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter isAuthenticated={true} />
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

  useScript(
    '//siteimproveanalytics.com/js/siteanalyze_6004851.js',
    false,
    true,
    IS_AP
  );

  useUsabilla();

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
