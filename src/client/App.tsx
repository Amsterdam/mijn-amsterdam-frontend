import classnames from 'classnames';
import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  matchPath,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { AppRoutes, FeatureToggle } from '../universal/config';
import { AppRoutesRedirect } from '../universal/config/routes';
import { isPrivateRoute } from '../universal/helpers';
import styles from './App.module.scss';
import { AutoLogoutDialog, MainFooter, MainHeader } from './components';
import MyAreaLoader from './components/MyArea/MyAreaLoader';
import { useAnalytics, usePageChange } from './hooks';
import { useSessionApi } from './hooks/api/useSessionApi';
import { useAppStateRemote } from './hooks/useAppState';
import {
  useDeeplinkRedirect,
  useSetDeeplinkEntry,
} from './hooks/useDeeplink.hook';
import { useProfileTypeValue } from './hooks/useProfileType';
import { useUsabilla } from './hooks/useUsabilla';

import { loginUrlByAuthMethod } from './config/api';
import { default as LandingPage } from './pages/Landing/Landing';

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
const BezwarenDetail = lazy(
  () => import('./pages/BezwarenDetail/BezwarenDetail')
);

const Horeca = lazy(() => import('./pages/Horeca/Horeca'));
const HorecaDetail = lazy(() => import('./pages/HorecaDetail/HorecaDetail'));

const LandingPageYivi = lazy(() => import('./pages/Landing/LandingYivi'));
const AVG = lazy(() => import('./pages/AVG/AVG'));
const AVGDetail = lazy(() => import('./pages/AVGDetail/AVGDetail'));
const BFF500Error = lazy(() => import('./pages/BffError/BffError'));

const Bodem = lazy(() => import('./pages/Bodem/Bodem'));
const LoodMeting = lazy(() => import('./pages/Bodem/LoodMeting'));
const Erfpacht = lazy(() => import('./pages/Erfpacht/Erfpacht'));
const ErfpachtDetail = lazy(() => import('./pages/Erfpacht/Erfpacht'));

function AppNotAuthenticated() {
  useSetDeeplinkEntry(['sso', 'authMethod']);
  usePageChange(false);
  useUsabilla();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
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
      <p className={styles.PreLoader}>
        Automatische toegang tot Mijn Amsterdam wordt gecontroleerd...
      </p>
    );
  }

  return (
    <>
      <MainHeader isAuthenticated={false} />
      <div className={classnames(styles.App, styles.NotYetAuthenticated)}>
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route exact path={AppRoutes.ROOT} component={LandingPage} />
          {FeatureToggle.yiviLandingActive && (
            <Route
              exact
              path={AppRoutes.YIVI_LANDING}
              component={LandingPageYivi}
            />
          )}
          <Route path={AppRoutes.ACCESSIBILITY} component={Accessibility} />
          <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
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
  usePageChange(true);

  const history = useHistory();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  useUsabilla(profileType);

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
              <Route
                path={[
                  AppRoutes['SIA/DETAIL/CLOSED'],
                  AppRoutes['SIA/DETAIL/OPEN'],
                ]}
                component={SiaDetail}
              />
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
            <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <MainFooter isAuthenticated={true} />
      </>
    );
  }

  const isHeroVisible = !matchPath(history.location.pathname, {
    path: AppRoutes.BUURT,
  });

  return (
    <>
      <MainHeader isAuthenticated={true} isHeroVisible={isHeroVisible} />
      <div className={styles.App} id="skip-to-id-AppContent">
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Route path={AppRoutes.NOTIFICATIONS} component={MyNotifications} />
          <Route path={AppRoutes.BRP} component={Profile} />
          <Route path={AppRoutes.KVK} component={ProfileCommercial} />
          {FeatureToggle.stadspasRequestsActive && (
            <Route
              path={AppRoutes['STADSPAS/AANVRAAG']}
              component={StadspasAanvraagDetail}
            />
          )}
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
            <Route
              path={AppRoutes['BEZWAREN/DETAIL']}
              component={BezwarenDetail}
            />
          )}
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
          {FeatureToggle.bodemActive && (
            <Route path={AppRoutes.BODEM} component={Bodem} />
          )}
          {FeatureToggle.bodemActive && (
            <Route
              path={AppRoutes['BODEM/LOOD_METING']}
              component={LoodMeting}
            />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route path={AppRoutes.ERFPACHTv2} component={Erfpacht} />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route
              path={AppRoutes['ERFPACHTv2/DOSSIER']}
              component={ErfpachtDetail}
            />
          )}
          <Route path={AppRoutes.SEARCH} component={Search} />
          <Route path={AppRoutes.PARKEREN} component={Parkeren} />
          <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
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
  useAnalytics(!!import.meta.env.REACT_APP_ANALYTICS_ID);

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className={styles.PreLoader}>
              De Mijn Amsterdam applicatie wordt geladen....
            </div>
          }
        >
          <AppLanding />
        </Suspense>
      </BrowserRouter>
    </RecoilRoot>
  );
}
