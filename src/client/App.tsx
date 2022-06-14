import classnames from 'classnames';
import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  matchPath,
  Redirect,
  Route,
  Switch,
  useHistory
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { AppRoutes, FeatureToggle } from '../universal/config';
import { getOtapEnvItem, IS_AP } from '../universal/config/env';
import { AppRoutesRedirect, NoHeroRoutes } from '../universal/config/routes';
import { isPrivateRoute } from '../universal/helpers';
import styles from './App.module.scss';
import { AutoLogoutDialog, MainFooter, MainHeader } from './components';
import MyAreaLoader from './components/MyArea/MyAreaLoader';
import { useAnalytics, usePageChange, useScript } from './hooks';
import { useSessionApi } from './hooks/api/useSessionApi';
import { useTipsApi } from './hooks/api/useTipsApi';
import { useAppStateRemote } from './hooks/useAppState';
import {
  useDeeplinkEntry, useDeeplinkRedirect
} from './hooks/useDeeplink.hook';
import { useProfileTypeValue } from './hooks/useProfileType';
import { useUsabilla } from './hooks/useUsabilla';

import { default as LandingPage } from './pages/Landing/Landing';

const BurgerzakenAkte = lazy(
  () => import('./pages/BurgerzakenDetail/BurgerzakenAkte')
);
const Krefia = lazy(() => import('./pages/Krefia/Krefia'));
const Parkeren = lazy(() => import('./pages/Parkeren/Parkeren'));
const ProfileCommercial = lazy(
  () => import('./pages/Profile/ProfileCommercial')
);
const Search = lazy(() => import('./pages/Search/Search'));
const Stadspas = lazy(() => import('./pages/Stadspas/Stadspas'));
const StadspasAanvraagDetail = lazy(
  () => import('./pages/StadspasDetail/StadspasAanvraagDetail')
);
const StadspasDetail = lazy(
  () => import('./pages/StadspasDetail/StadspasDetail')
);
const InkomenDetailBbz = lazy(
  () => import('./pages/InkomenDetail/InkomenDetailBbz')
);
const InkomenDetailTonk = lazy(
  () => import('./pages/InkomenDetail/InkomenDetailTonk')
);
const InkomenDetailTozo = lazy(
  () => import('./pages/InkomenDetail/InkomenDetailTozo')
);
const InkomenDetailUitkering = lazy(
  () => import('./pages/InkomenDetail/InkomenDetailUitkering')
);
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const MyNotifications = lazy(
  () => import('./pages/MyNotifications/MyNotifications')
);
const Accessibility = lazy(() => import('./pages/Accessibility/Accessibility'));
const Burgerzaken = lazy(() => import('./pages//Burgerzaken/Burgerzaken'));
const BurgerzakenIDKaart = lazy(
  () => import('./pages/BurgerzakenDetail/BurgerzakenIDKaart')
);
const GarbageInformation = lazy(
  () => import('./pages/GarbageInformation/GarbageInformation')
);
const GeneralInfo = lazy(() => import('./pages/GeneralInfo/GeneralInfo'));
const Inkomen = lazy(() => import('./pages/Inkomen/Inkomen'));
const InkomenSpecificaties = lazy(
  () => import('./pages/InkomenSpecificaties/InkomenSpecificaties')
);
const Klachten = lazy(() => import('./pages/Klachten/Klachten'));
const KlachtenDetail = lazy(
  () => import('./pages/KlachtenDetail/KlachtenDetail')
);
const MyTips = lazy(() => import('./pages/MyTips/MyTips'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Profile = lazy(() => import('./pages/Profile/ProfilePrivate'));
const ToeristischeVerhuur = lazy(
  () => import('./pages/ToeristischeVerhuur/ToeristischeVerhuur')
);
const ToeristischeVerhuurDetail = lazy(
  () => import('./pages/ToeristischeVerhuurDetail/ToeristischeVerhuurDetail')
);
const VergunningDetail = lazy(
  () => import('./pages/VergunningDetail/VergunningDetail')
);
const Vergunningen = lazy(() => import('./pages/Vergunningen/Vergunningen'));
const Zorg = lazy(() => import('./pages/Zorg/Zorg'));
const ZorgDetail = lazy(() => import('./pages/ZorgDetail/ZorgDetail'));

function AppNotAuthenticated() {
  useDeeplinkEntry();

  return (
    <>
      <MainHeader isAuthenticated={false} />
      <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
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
  useAppStateRemote();
  useTipsApi();
  usePageChange();

  const history = useHistory();
  const profileType = useProfileTypeValue();

  const isNoHeroRoute = NoHeroRoutes.some((route) =>
    matchPath(history.location.pathname, { path: route })
  );

  const redirectAfterLogin = useDeeplinkRedirect();

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      history.push(redirectAfterLogin);
    }
  }, [redirectAfterLogin, history])

  return (
    <>
      <MainHeader isAuthenticated={true} isHeroVisible={!isNoHeroRoute} />
      <div className={styles.App} id="skip-to-id-AppContent">
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
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
          {FeatureToggle.inkomenBBZActive && (
            <Route
              path={AppRoutes['INKOMEN/BBZ']}
              component={InkomenDetailBbz}
            />
          )}
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
          <Route
            path={AppRoutes['KLACHTEN/KLACHT']}
            component={KlachtenDetail}
          />
          <Route path={AppRoutes.KLACHTEN} component={Klachten} />
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
          {FeatureToggle.krefiaActive && (
            <Route path={AppRoutes.KREFIA} component={Krefia} />
          )}
          <Route path={AppRoutes.SEARCH} component={Search} />
          <Route path={AppRoutes.PARKEREN} component={Parkeren} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter isAuthenticated={true} />
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
  const { isPristine, isAuthenticated } = session;

  // If session was previously authenticated we don't want to show the loader again
  if (isPristine) {
    return <p className={styles.PreLoader}>Welkom op Mijn Amsterdam</p>;
  }

  return isAuthenticated ? (
    <>
      <AppAuthenticated />
      <AutoLogoutDialog />
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

  useScript({
    src: '//siteimproveanalytics.com/js/siteanalyze_6004851.js',
    defer: false,
    async: true,
    isEnabled: IS_AP,
  });

  useUsabilla();

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className={styles.PreLoader}>
              Loading Mijn Amsterdam bundle...
            </div>
          }
        >
          <AppLanding />
        </Suspense>
      </BrowserRouter>
    </RecoilRoot>
  );
}
