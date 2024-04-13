import classnames from 'classnames';
import { useEffect } from 'react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  matchPath,
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

import Burgerzaken from './pages//Burgerzaken/Burgerzaken';
import Accessibility from './pages/Accessibility/Accessibility';
import BurgerzakenIDKaart from './pages/BurgerzakenDetail/BurgerzakenIDKaart';
import Wonen from './pages/Wonen/Wonen';

import Dashboard from './pages/Dashboard/Dashboard';
import GarbageInformation from './pages/GarbageInformation/GarbageInformation';
import GeneralInfo from './pages/GeneralInfo/GeneralInfo';
import Inkomen from './pages/Inkomen/Inkomen';
import InkomenDetailBbz from './pages/InkomenDetail/InkomenDetailBbz';
import InkomenDetailTonk from './pages/InkomenDetail/InkomenDetailTonk';
import InkomenDetailTozo from './pages/InkomenDetail/InkomenDetailTozo';
import InkomenDetailUitkering from './pages/InkomenDetail/InkomenDetailUitkering';
import InkomenSpecificaties from './pages/InkomenSpecificaties/InkomenSpecificaties';
import Klachten from './pages/Klachten/Klachten';
import KlachtenDetail from './pages/KlachtenDetail/KlachtenDetail';
import Krefia from './pages/Krefia/Krefia';
import MyNotifications from './pages/MyNotifications/MyNotifications';
import NotFound from './pages/NotFound/NotFound';
import Parkeren from './pages/Parkeren/Parkeren';
import ProfileCommercial from './pages/Profile/ProfileCommercial';
import Profile from './pages/Profile/ProfilePrivate';
import Search from './pages/Search/Search';
// import Sia from './pages/Sia/Sia';
// import SiaListClosed from './pages/Sia/SiaListClosed';
// import SiaListOpen from './pages/Sia/SiaListOpen';
// import SiaDetail from './pages/SiaDetail/SiaDetail';
import Stadspas from './pages/Stadspas/Stadspas';
import StadspasAanvraagDetail from './pages/StadspasDetail/StadspasAanvraagDetail';
import StadspasDetail from './pages/StadspasDetail/StadspasDetail';
import ToeristischeVerhuur from './pages/ToeristischeVerhuur/ToeristischeVerhuur';
import ToeristischeVerhuurDetail from './pages/ToeristischeVerhuurDetail/ToeristischeVerhuurDetail';
import VergunningDetail from './pages/VergunningDetail/VergunningDetail';
import Vergunningen from './pages/Vergunningen/Vergunningen';
import Zorg from './pages/Zorg/Zorg';
import ZorgDetail from './pages/ZorgDetail/ZorgDetail';

import Bezwaren from './pages/Bezwaren/Bezwaren';
import BezwarenDetail from './pages/BezwarenDetail/BezwarenDetail';

import Horeca from './pages/Horeca/Horeca';
import HorecaDetail from './pages/HorecaDetail/HorecaDetail';

import AVG from './pages/AVG/AVG';
import AVGDetail from './pages/AVGDetail/AVGDetail';
import BFF500Error from './pages/BffError/BffError';
import LandingPageYivi from './pages/Landing/LandingYivi';

import Bodem from './pages/Bodem/Bodem';
import LoodMeting from './pages/Bodem/LoodMeting';
import ErfpachtDossierDetail from './pages/Erfpacht/DossierDetail/ErfpachtDossierDetail';
import Erfpacht from './pages/Erfpacht/Erfpacht';
import ErfpachtDossiers from './pages/Erfpacht/ErfpachtDossiers';
import ErfpachtFacturen from './pages/Erfpacht/ErfpachtFacturen';
import ErfpachtOpenFacturen from './pages/Erfpacht/ErfpachtOpenFacturen';

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

  // NOTE: To be removed
  // if (profileType === 'private-attributes') {
  //   return (
  //     <>
  //       <MainHeader isAuthenticated={true} isHeroVisible={true} />
  //       <div className={styles.App} id="skip-to-id-AppContent">
  //         <Switch>
  //           {FeatureToggle.siaActive && (
  //             <Route
  //               path={[
  //                 AppRoutes['SIA/DETAIL/CLOSED'],
  //                 AppRoutes['SIA/DETAIL/OPEN'],
  //               ]}
  //               component={SiaDetail}
  //             />
  //           )}
  //           {FeatureToggle.siaActive && (
  //             <Route path={AppRoutes.SIA_OPEN} component={SiaListOpen} />
  //           )}
  //           {FeatureToggle.siaActive && (
  //             <Route path={AppRoutes.SIA_CLOSED} component={SiaListClosed} />
  //           )}
  //           {FeatureToggle.siaActive && (
  //             <Route path={[AppRoutes.ROOT, AppRoutes.SIA]} component={Sia} />
  //           )}
  //           <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
  //           <Route component={NotFound} />
  //         </Switch>
  //       </div>
  //       <MainFooter isAuthenticated={true} />
  //     </>
  //   );
  // }

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
          {/* {FeatureToggle.mijnWoningActive && ( */}
          <Route path={AppRoutes.WONEN} component={Wonen} />
          {/* )} */}
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
            <Route
              path={AppRoutes['ERFPACHTv2/DOSSIERS']}
              component={ErfpachtDossiers}
            />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route
              path={AppRoutes['ERFPACHTv2/ALLE_FACTUREN']}
              component={ErfpachtFacturen}
            />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route
              path={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
              component={ErfpachtOpenFacturen}
            />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route
              path={AppRoutes['ERFPACHTv2/DOSSIERDETAIL']}
              component={ErfpachtDossierDetail}
            />
          )}
          {FeatureToggle.erfpachtV2Active && (
            <Route path={AppRoutes.ERFPACHTv2} component={Erfpacht} />
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
        <AppLanding />
      </BrowserRouter>
    </RecoilRoot>
  );
}
