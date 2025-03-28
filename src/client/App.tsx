import { useEffect } from 'react';

import { Paragraph, Screen, SkipLink } from '@amsterdam/design-system-react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import styles from './App.module.scss';
import { AutoLogoutDialog } from './components/AutoLogoutDialog/AutoLogoutDialog';
import { ErrorMessages } from './components/ErrorMessages/ErrorMessages';
import { MainFooter } from './components/MainFooter/MainFooter';
import { MainHeader } from './components/MainHeader/MainHeader';
import { MainHeaderHero } from './components/MainHeaderHero/MainHeaderHero';
import { MyAreaLoader } from './components/MyArea/MyAreaLoader';
import { loginUrlByAuthMethod } from './config/api';
import { AppRoutesRedirect, isPrivateRoute } from './config/routes';
import { useMonitoring } from './helpers/monitoring';
import { useAnalytics } from './hooks/analytics.hook';
import { useSessionApi } from './hooks/api/useSessionApi';
import { useAppStateRemote } from './hooks/useAppState';
import {
  clearDeeplinkEntry,
  useDeeplinkRedirect,
  useSetDeeplinkEntry,
} from './hooks/useDeeplink.hook';
import { usePageChange } from './hooks/usePageChange';
import { useProfileTypeValue } from './hooks/useProfileType';
import { useTrackThemas } from './hooks/useTrackThemas.hook';
import { useUsabilla } from './hooks/useUsabilla';
import { FeatureToggle } from '../universal/config/feature-toggles';
import { AppRoutes } from '../universal/config/routes';
import { Accessibility } from './pages/Accessibility/Accessibility';
import { AfisThemaPagina } from './pages/Afis/Afis';
import { AfisBetaalVoorkeuren } from './pages/Afis/AfisBetaalVoorkeuren';
import { AfisFacturen } from './pages/Afis/AfisFacturen';
import { AVG } from './pages/AVG/AVG';
import { AVGDetail } from './pages/AVG/AVGDetail';
import { AVGList } from './pages/AVG/AVGLijst';
import { BezwarenThemaPagina } from './pages/Bezwaren/Bezwaren';
import { BezwarenDetailPagina } from './pages/Bezwaren/BezwarenDetail';
import { BezwarenLijstPagina } from './pages/Bezwaren/BezwarenLijst';
import { BFF500Error } from './pages/BffError/BffError';
import { Bodem } from './pages/Bodem/Bodem';
import { BodemList } from './pages/Bodem/BodemList';
import { LoodMeting } from './pages/Bodem/LoodMeting';
import { Burgerzaken } from './pages/Burgerzaken/Burgerzaken';
import { BurgerzakenIdentiteitsbewijs } from './pages/Burgerzaken/BurgerzakenIdentiteitsbewijs';
import { BurgerZakenList } from './pages/Burgerzaken/BurgerZakenList';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ErfpachtDossierDetail } from './pages/Erfpacht/DossierDetail/ErfpachtDossierDetail';
import { Erfpacht } from './pages/Erfpacht/Erfpacht';
import { ErfpachtDossiers } from './pages/Erfpacht/ErfpachtDossiers';
import { ErfpachtFacturen } from './pages/Erfpacht/ErfpachtFacturen';
import { ErfpachtOpenFacturen } from './pages/Erfpacht/ErfpachtOpenFacturen';
import { GarbageInformation } from './pages/GarbageInformation/GarbageInformation';
import { GeneralInfo } from './pages/GeneralInfo/GeneralInfo';
import { HLIRegeling } from './pages/HLI/HLIRegeling';
import { HLIRegelingen } from './pages/HLI/HLIRegelingen';
import { HLIStadspasDetail } from './pages/HLI/HLIStadspasDetail';
import { HLIThemaPagina } from './pages/HLI/HLIThemaPagina';
import { HorecaThemaPagina } from './pages/Horeca/Horeca';
import { HorecaDetailPagina } from './pages/Horeca/HorecaDetail';
import { HorecaLijstPagina } from './pages/Horeca/HorecaList';
import { InkomenThemaPagina } from './pages/Inkomen/Inkomen';
import { InkomenDetailBbz } from './pages/Inkomen/InkomenDetailBbz';
import { InkomenDetailTonk } from './pages/Inkomen/InkomenDetailTonk';
import { InkomenDetailTozo } from './pages/Inkomen/InkomenDetailTozo';
import { InkomenDetailUitkering } from './pages/Inkomen/InkomenDetailUitkering';
import { InkomenLijstPagina } from './pages/Inkomen/InkomenListPage';
import { InkomenSpecificaties } from './pages/Inkomen/InkomenSpecificaties';
import { KlachtenThemaPagina } from './pages/Klachten/Klachten';
import { KlachtenDetailPagina } from './pages/Klachten/KlachtenDetail';
import { KlachtenLijstPagina } from './pages/Klachten/KlachtenLijst';
import { KrefiaThemaPagina } from './pages/Krefia/Krefia';
import { LandingPage } from './pages/Landing/Landing';
import { MyNotificationsPage } from './pages/MyNotifications/MyNotifications';
import { NotFound } from './pages/NotFound/NotFound';
import { Parkeren } from './pages/Parkeren/Parkeren';
import { ParkerenDetailPagina } from './pages/Parkeren/ParkerenDetail';
import { ParkerenList } from './pages/Parkeren/ParkerenList';
import { MijnBedrijfsGegevensThema } from './pages/Profile/commercial/ProfileCommercial';
import { ContactmomentenListPage } from './pages/Profile/private/ContactmomentenListPage';
import { MijnGegevensThema } from './pages/Profile/private/ProfilePrivate';
import { SearchPage } from './pages/Search/Search';
import { ToeristscheVerhuurThema } from './pages/ToeristischeVerhuur/ToeristischeVerhuur';
import { ToeristischeVerhuurDetailPagina } from './pages/ToeristischeVerhuur/ToeristischeVerhuurDetail';
import { ToeristischeVerhuurVergunningen } from './pages/ToeristischeVerhuur/ToeristischeVerhuurVergunningenList';
import { Varen } from './pages/Varen/Varen';
import { VarenDetail } from './pages/Varen/VarenDetail';
import { VarenList } from './pages/Varen/VarenList';
import { VergunningDetailPagina } from './pages/Vergunningen/VergunningDetail';
import { VergunningenThemaPagina } from './pages/Vergunningen/Vergunningen';
import { VergunningenList } from './pages/Vergunningen/VergunningenList';
import { ZaakStatus } from './pages/ZaakStatus/ZaakStatus';
import { ZorgThemaPagina } from './pages/Zorg/Zorg';
import { ZorgRegelingen } from './pages/Zorg/ZorgRegelingen';
import { ZorgDetail } from './pages/ZorgDetail/ZorgDetail';

function AppNotAuthenticated() {
  useSetDeeplinkEntry(['sso', 'authMethod']);
  usePageChange(false);
  useUsabilla();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Note: see MIJN-5785
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
      <Paragraph className={styles.PreLoader}>
        Automatische toegang tot Mijn Amsterdam wordt gecontroleerd...
      </Paragraph>
    );
  }
  return (
    <>
      <MainHeader isAuthenticated={false} />
      <Screen className={styles.App}>
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route exact path={AppRoutes.HOME} component={LandingPage} />
          <Route path={AppRoutes.ACCESSIBILITY} component={Accessibility} />
          <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
          <Route
            render={({ location: { pathname } }) => {
              if (isPrivateRoute(pathname)) {
                // Private routes are redirected to Home
                return <Redirect to={AppRoutes.HOME} />;
              }
              // All other routes are presented with a 404 page
              return <Route component={NotFound} />;
            }}
          />
        </Switch>
      </Screen>
      <MainFooter />
    </>
  );
}

function AppAuthenticated() {
  useAppStateRemote();
  usePageChange(true);
  useTrackThemas();

  const history = useHistory();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  useUsabilla(profileType);

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      clearDeeplinkEntry();
      history.push(redirectAfterLogin);
    }
  }, [redirectAfterLogin, history]);

  const isHeroVisible = history.location.pathname === AppRoutes.HOME;

  return (
    <>
      <SkipLink href="#skip-to-id-AppContent">Direct naar inhoud</SkipLink>
      <MainHeader isAuthenticated />
      <ErrorMessages />
      {isHeroVisible && <MainHeaderHero />}
      <Screen className={styles.App}>
        <Switch>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Redirect key={from + to} from={from} to={to} />
          ))}
          <Route path={AppRoutes.ZAAK_STATUS} component={ZaakStatus} />
          <Route path={AppRoutes.BUURT} component={MyAreaLoader} />
          <Route exact path={AppRoutes.HOME} component={Dashboard} />
          <Route
            path={AppRoutes.NOTIFICATIONS}
            component={MyNotificationsPage}
          />
          <Route path={AppRoutes.BRP} component={MijnGegevensThema} />
          <Route path={AppRoutes.KVK} component={MijnBedrijfsGegevensThema} />
          {FeatureToggle.hliThemaStadspasActive && (
            <Route
              path={AppRoutes['HLI/STADSPAS']}
              component={HLIStadspasDetail}
            />
          )}
          {FeatureToggle.hliThemaRegelingenActive && (
            <Route path={AppRoutes['HLI/REGELING']} component={HLIRegeling} />
          )}
          {FeatureToggle.hliThemaRegelingenActive && (
            <Route
              path={AppRoutes['HLI/REGELINGEN_LIST']}
              component={HLIRegelingen}
            />
          )}
          {FeatureToggle.hliThemaActive && (
            <Route path={AppRoutes.HLI} component={HLIThemaPagina} />
          )}

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
          <Route
            path={AppRoutes['INKOMEN/LIST']}
            component={InkomenLijstPagina}
          />
          <Route path={AppRoutes.INKOMEN} component={InkomenThemaPagina} />
          <Route path={AppRoutes['ZORG/VOORZIENING']} component={ZorgDetail} />
          {FeatureToggle.zorgv2ThemapaginaActive && (
            <Route
              path={AppRoutes['ZORG/VOORZIENINGEN_LIST']}
              component={ZorgRegelingen}
            />
          )}
          {FeatureToggle.zorgv2ThemapaginaActive && (
            <Route path={AppRoutes.ZORG} component={ZorgThemaPagina} />
          )}

          <Route
            path={AppRoutes['BURGERZAKEN/LIST']}
            component={BurgerZakenList}
          />
          <Route
            path={AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS']}
            component={BurgerzakenIdentiteitsbewijs}
          />
          <Route path={AppRoutes.BURGERZAKEN} component={Burgerzaken} />
          {FeatureToggle.garbageInformationPage && (
            <Route path={AppRoutes.AFVAL} component={GarbageInformation} />
          )}
          <Route path={AppRoutes.ACCESSIBILITY} component={Accessibility} />
          <Route path={AppRoutes.GENERAL_INFO} component={GeneralInfo} />
          <Route
            path={AppRoutes['VERGUNNINGEN/LIST']}
            component={VergunningenList}
          />
          <Route
            path={AppRoutes['VERGUNNINGEN/DETAIL']}
            component={VergunningDetailPagina}
          />
          <Route
            path={AppRoutes.VERGUNNINGEN}
            component={VergunningenThemaPagina}
          />
          <Route
            path={AppRoutes['KLACHTEN/KLACHT']}
            component={KlachtenDetailPagina}
          />
          <Route
            path={AppRoutes['KLACHTEN/LIST']}
            component={KlachtenLijstPagina}
          />
          <Route path={AppRoutes.KLACHTEN} component={KlachtenThemaPagina} />
          {FeatureToggle.bezwarenActive && (
            <Route
              path={AppRoutes['BEZWAREN/LIST']}
              component={BezwarenLijstPagina}
            />
          )}
          {FeatureToggle.bezwarenActive && (
            <Route
              path={AppRoutes['BEZWAREN/DETAIL']}
              component={BezwarenDetailPagina}
            />
          )}
          {FeatureToggle.bezwarenActive && (
            <Route path={AppRoutes.BEZWAREN} component={BezwarenThemaPagina} />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/LIST']}
              component={ToeristischeVerhuurVergunningen}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']}
              component={ToeristischeVerhuurDetailPagina}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes.TOERISTISCHE_VERHUUR}
              component={ToeristscheVerhuurThema}
            />
          )}
          {FeatureToggle.varenActive && (
            <Route path={AppRoutes['VAREN/DETAIL']} component={VarenDetail} />
          )}
          {FeatureToggle.varenActive && (
            <Route path={AppRoutes['VAREN/LIST']} component={VarenList} />
          )}
          {FeatureToggle.varenActive && (
            <Route path={AppRoutes.VAREN} component={Varen} />
          )}
          {FeatureToggle.afisActive && (
            <Route
              path={AppRoutes['AFIS/BETAALVOORKEUREN']}
              component={AfisBetaalVoorkeuren}
            />
          )}
          {FeatureToggle.afisActive && (
            <Route path={AppRoutes['AFIS/FACTUREN']} component={AfisFacturen} />
          )}
          {FeatureToggle.afisActive && (
            <Route path={AppRoutes.AFIS} component={AfisThemaPagina} />
          )}
          {FeatureToggle.krefiaActive && (
            <Route path={AppRoutes.KREFIA} component={KrefiaThemaPagina} />
          )}
          {FeatureToggle.horecaActive && (
            <Route
              path={AppRoutes['HORECA/LIST']}
              component={HorecaLijstPagina}
            />
          )}
          {FeatureToggle.horecaActive && (
            <Route
              path={AppRoutes['HORECA/DETAIL']}
              component={HorecaDetailPagina}
            />
          )}
          {FeatureToggle.horecaActive && (
            <Route path={AppRoutes.HORECA} component={HorecaThemaPagina} />
          )}
          {FeatureToggle.avgActive && (
            <Route path={AppRoutes['AVG/DETAIL']} component={AVGDetail} />
          )}
          {FeatureToggle.avgActive && (
            <Route path={AppRoutes['AVG/LIST']} component={AVGList} />
          )}
          {FeatureToggle.avgActive && (
            <Route path={AppRoutes.AVG} component={AVG} />
          )}
          {FeatureToggle.bodemActive && (
            <Route path={AppRoutes['BODEM/LIST']} component={BodemList} />
          )}

          {FeatureToggle.bodemActive && (
            <Route
              path={AppRoutes['BODEM/LOOD_METING']}
              component={LoodMeting}
            />
          )}
          {FeatureToggle.contactmomentenActive && (
            <Route
              path={AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']}
              component={ContactmomentenListPage}
            />
          )}
          {FeatureToggle.bodemActive && (
            <Route path={AppRoutes.BODEM} component={Bodem} />
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
          <Route path={AppRoutes.SEARCH} component={SearchPage} />
          <Route path={AppRoutes['PARKEREN/LIST']} component={ParkerenList} />
          <Route
            path={AppRoutes['PARKEREN/DETAIL']}
            component={ParkerenDetailPagina}
          />
          <Route path={AppRoutes.PARKEREN} component={Parkeren} />
          <Route path={AppRoutes.BFF_500_ERROR} component={BFF500Error} />
          <Route component={NotFound} />
        </Switch>
      </Screen>
      {/** Remove the footer on the Map view for better UX */}
      {location.pathname !== AppRoutes.BUURT && <MainFooter isAuthenticated />}
    </>
  );
}

function AppLanding() {
  const session = useSessionApi();
  const { isPristine, isAuthenticated } = session;

  // If session was previously authenticated we don't want to show the loader again
  if (isPristine) {
    return (
      <Paragraph className={styles.PreLoader}>
        Welkom op Mijn Amsterdam
      </Paragraph>
    );
  }

  return isAuthenticated ? (
    <>
      <AppAuthenticated />
      {!!session.expiresAtMilliseconds && (
        <AutoLogoutDialog
          expiresAtMilliseconds={session.expiresAtMilliseconds}
        />
      )}
    </>
  ) : (
    <AppNotAuthenticated />
  );
}

export function App() {
  /**
   * Visitor analytics and support
   */
  useAnalytics(!!import.meta.env.REACT_APP_ANALYTICS_ID);
  useMonitoring();

  return (
    <RecoilRoot>
      <BrowserRouter>
        <AppLanding />
      </BrowserRouter>
    </RecoilRoot>
  );
}
