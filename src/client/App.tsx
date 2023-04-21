import classnames from 'classnames';
import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  matchPath,
  Redirect,
  Route,
  Switch,
  useHistory,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { AppRoutes, FeatureToggle } from '../universal/config';
import { getOtapEnvItem } from '../universal/config/env';
import { AppRoutesRedirect } from '../universal/config/routes';
import { isPrivateRoute } from '../universal/helpers';
import styles from './App.module.scss';
import { AutoLogoutDialog, MainFooter, MainHeader } from './components';
import MyAreaLoader from './components/MyArea/MyAreaLoader';
import { isUiElementVisible } from './config/app';
import { useAnalytics, usePageChange } from './hooks';
import { useSessionApi } from './hooks/api/useSessionApi';
import { useTipsApi } from './hooks/api/useTipsApi';
import { useAppStateRemote } from './hooks/useAppState';
import {
  useDeeplinkEntry,
  useDeeplinkRedirect,
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
const Sia = lazy(() => import('./pages/Sia/Sia'));
const SiaDetail = lazy(() => import('./pages/SiaDetail/SiaDetail'));
const SiaListClosed = lazy(() => import('./pages/Sia/SiaListClosed'));
const SiaListOpen = lazy(() => import('./pages/Sia/SiaListOpen'));
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

const Bezwaren = lazy(() => import('./pages/Bezwaren/Bezwaren'));

const Horeca = lazy(() => import('./pages/Horeca/Horeca'));
const HorecaDetail = lazy(() => import('./pages/HorecaDetail/HorecaDetail'));

const LandingPageYivi = lazy(() => import('./pages/Landing/LandingYivi'));
const AVG = lazy(() => import('./pages/AVG/AVG'));
const AVGDetail = lazy(() => import('./pages/AVGDetail/AVGDetail'));

function AppNotAuthenticated() {
  useDeeplinkEntry();
  usePageChange(false);

  return (
    <>
      <MainHeader isAuthenticated={false} />
      <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route exact path={AppRoutes.ROOT} component={LandingPage} />
          <Route
            exact
            path={AppRoutes.YIVI_LANDING}
            component={LandingPageYivi}
          />
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
  usePageChange(true);

  const history = useHistory();
  const profileType = useProfileTypeValue();

  const isHeroVisible = !(
    isUiElementVisible(profileType, 'mijnBuurt') &&
    matchPath(history.location.pathname, { path: AppRoutes.BUURT })
  );

  const redirectAfterLogin = useDeeplinkRedirect();

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      history.push(redirectAfterLogin);
    }
  }, [redirectAfterLogin, history]);

  if (profileType === 'private-attributes') {
    return (
      <>
        <MainHeader isAuthenticated={true} isHeroVisible={true} />
        <div className={styles.App} id="skip-to-id-AppContent">
          <Switch>
            {FeatureToggle.siaActive && (
              <Route path={AppRoutes['SIA/DETAIL']} component={SiaDetail} />
            )}
            {FeatureToggle.siaActive && (
              <Route path={AppRoutes.SIA_OPEN} component={SiaListOpen} />
            )}
            {FeatureToggle.siaActive && (
              <Route path={AppRoutes.SIA_CLOSED} component={SiaListClosed} />
            )}
            {FeatureToggle.siaActive && (
              <Route path={[AppRoutes.ROOT, AppRoutes.SIA]} component={Sia} />
            )}

            <Route component={NotFound} />
          </Switch>
        </div>
        <MainFooter isAuthenticated={true} />
      </>
    );
  }

  return (
    <>
      <MainHeader isAuthenticated={true} isHeroVisible={isHeroVisible} />
      <div className={styles.App} id="skip-to-id-AppContent">
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          {isUiElementVisible(profileType, 'mijnBuurt') && (
            <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
          )}
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
          {FeatureToggle.bezwarenActive && (
            <Route path={AppRoutes.BEZWAREN} component={Bezwaren} />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={[
                AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'],
                AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'],
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
          {FeatureToggle.horecaActive && (
            <Route path={AppRoutes['HORECA/DETAIL']} component={HorecaDetail} />
          )}
          {FeatureToggle.horecaActive && (
            <Route path={AppRoutes.HORECA} component={Horeca} />
          )}
          {FeatureToggle.avgActive && (
            <Route path={AppRoutes['AVG/DETAIL']} component={AVGDetail} />
          )}
          {FeatureToggle.avgActive && (
            <Route path={AppRoutes.AVG} component={AVG} />
          )}

          <Route path={AppRoutes.SEARCH} component={Search} />
          {isUiElementVisible(profileType, 'search') && (
            <Route path={AppRoutes.SEARCH} component={Search} />
          )}
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
