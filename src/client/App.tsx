import { useEffect } from 'react';

import { Paragraph, Screen, SkipLink } from '@amsterdam/design-system-react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';
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
import { AfvalInformation } from './pages/Afval/Afval';
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
import { ZorgDetail } from './pages/Zorg/ZorgDetail';
import { ZorgRegelingen } from './pages/Zorg/ZorgRegelingen';

function RedirectExisting() {
  const location = useLocation();
  const pathname = location.pathname;

  if (isPrivateRoute(pathname)) {
    // Private routes are redirected to Home
    return <Navigate to={AppRoutes.HOME} />;
  }

  // All other routes are presented with a 404 page
  return <NotFound />;
}

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
        <Routes>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Route
              key={from + to}
              path={from}
              element={<Navigate replace to={to} />}
            />
          ))}
          {[
            {
              route: AppRoutes.HOME,
              Component: LandingPage,
              props: { index: true },
            },
            { route: AppRoutes.ACCESSIBILITY, Component: Accessibility },
            { route: AppRoutes.BFF_500_ERROR, Component: BFF500Error },
          ].map(({ route, Component, props }) => (
            <Route
              {...(props ? props : {})}
              key={route}
              path={route}
              element={<Component />}
            />
          ))}
          <Route element={<RedirectExisting />} />
        </Routes>
      </Screen>
      <MainFooter />
    </>
  );
}

function AppAuthenticated() {
  useAppStateRemote();
  usePageChange(true);
  useTrackThemas();

  const navigate = useNavigate();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const redirectAfterLogin = useDeeplinkRedirect();

  useUsabilla(profileType);

  useEffect(() => {
    if (redirectAfterLogin && redirectAfterLogin !== '/') {
      clearDeeplinkEntry();
      navigate(redirectAfterLogin);
    }
  }, [redirectAfterLogin]);

  const isHeroVisible = location.pathname === AppRoutes.HOME;
  const isBuurt = location.pathname === AppRoutes.BUURT;

  return (
    <>
      <SkipLink href="#skip-to-id-AppContent">Direct naar inhoud</SkipLink>
      <MainHeader isAuthenticated />
      <ErrorMessages />
      {isHeroVisible && <MainHeaderHero />}
      <Screen className={!isBuurt ? styles.App : ''}>
        <Routes>
          {AppRoutesRedirect.map(({ from, to }) => (
            <Route
              key={from + to}
              path={from}
              element={<Navigate replace to={to} />}
            />
          ))}
          {[
            {
              route: AppRoutes.HOME,
              Component: Dashboard,
              props: { index: true },
            },
            { route: AppRoutes.ZAAK_STATUS, Component: ZaakStatus },
            { route: AppRoutes.BUURT, Component: MyAreaLoader },
            { route: AppRoutes.BRP, Component: MijnGegevensThema },
            { route: AppRoutes.KVK, Component: MijnBedrijfsGegevensThema },
            { route: AppRoutes.NOTIFICATIONS, Component: MyNotificationsPage },
            { route: AppRoutes.INKOMEN, Component: InkomenThemaPagina },
            { route: AppRoutes.BURGERZAKEN, Component: Burgerzaken },
            { route: AppRoutes.KLACHTEN, Component: KlachtenThemaPagina },
            { route: AppRoutes.ACCESSIBILITY, Component: Accessibility },
            { route: AppRoutes.GENERAL_INFO, Component: GeneralInfo },
            { route: AppRoutes.SEARCH, Component: SearchPage },
            { route: AppRoutes['PARKEREN/LIST'], Component: ParkerenList },
            { route: AppRoutes.PARKEREN, Component: Parkeren },
            { route: AppRoutes.BFF_500_ERROR, Component: BFF500Error },
            {
              route: AppRoutes['HLI/REGELING'],
              Component: HLIRegeling,
              isActive: FeatureToggle.hliThemaRegelingenActive,
            },
            {
              route: AppRoutes['HLI/STADSPAS'],
              Component: HLIStadspasDetail,
              isActive: FeatureToggle.hliThemaStadspasActive,
            },
            {
              route: AppRoutes.HLI,
              Component: HLIThemaPagina,
              isActive: FeatureToggle.hliThemaActive,
            },
            {
              route: AppRoutes.ZORG,
              Component: ZorgThemaPagina,
              isActive: FeatureToggle.zorgv2ThemapaginaActive,
            },
            {
              route: AppRoutes.AFVAL,
              Component: AfvalInformation,
              isActive: FeatureToggle.garbageInformationPage,
            },
            {
              route: AppRoutes['VAREN/DETAIL'],
              Component: VarenDetail,
              isActive: FeatureToggle.varenActive,
            },
            {
              route: AppRoutes['VAREN/LIST'],
              Component: VarenList,
              isActive: FeatureToggle.varenActive,
            },
            {
              route: AppRoutes.VAREN,
              Component: Varen,
              isActive: FeatureToggle.varenActive,
            },
            {
              route: AppRoutes.AFIS,
              Component: AfisThemaPagina,
              isActive: FeatureToggle.afisActive,
            },
            {
              route: AppRoutes.KREFIA,
              Component: KrefiaThemaPagina,
              isActive: FeatureToggle.krefiaActive,
            },
            {
              route: AppRoutes.HORECA,
              Component: HorecaThemaPagina,
              isActive: FeatureToggle.horecaActive,
            },
            {
              route: AppRoutes['AVG/DETAIL'],
              Component: AVGDetail,
              isActive: FeatureToggle.avgActive,
            },
            {
              route: AppRoutes['AVG/LIST'],
              Component: AVGList,
              isActive: FeatureToggle.avgActive,
            },
            {
              route: AppRoutes.AVG,
              Component: AVG,
              isActive: FeatureToggle.avgActive,
            },
            {
              route: AppRoutes['BODEM/LIST'],
              Component: BodemList,
              isActive: FeatureToggle.bodemActive,
            },
            {
              route: AppRoutes.BODEM,
              Component: Bodem,
              isActive: FeatureToggle.bodemActive,
            },
            {
              route: AppRoutes.ERFPACHT,
              Component: Erfpacht,
              isActive: FeatureToggle.erfpachtActive,
            },
          ].map(({ route, Component, props }) => (
            <Route
              {...(props ? props : {})}
              key={route}
              path={route}
              element={<Component />}
            />
          ))}

          {FeatureToggle.hliThemaRegelingenActive && (
            <Route
              path={AppRoutes['HLI/REGELINGEN_LIST']}
              element={<HLIRegelingen />}
            />
          )}

          <Route
            path={AppRoutes['INKOMEN/BIJSTANDSUITKERING']}
            element={<InkomenDetailUitkering />}
          />
          <Route
            path={AppRoutes['INKOMEN/SPECIFICATIES']}
            element={<InkomenSpecificaties />}
          />

          <Route
            path={AppRoutes['INKOMEN/TOZO']}
            element={<InkomenDetailTozo />}
          />
          <Route
            path={AppRoutes['INKOMEN/TONK']}
            element={<InkomenDetailTonk />}
          />
          {FeatureToggle.inkomenBBZActive && (
            <Route
              path={AppRoutes['INKOMEN/BBZ']}
              element={<InkomenDetailBbz />}
            />
          )}
          <Route
            path={AppRoutes['INKOMEN/LIST']}
            element={<InkomenLijstPagina />}
          />

          <Route
            path={AppRoutes['ZORG/VOORZIENING']}
            element={<ZorgDetail />}
          />
          {FeatureToggle.zorgv2ThemapaginaActive && (
            <Route
              path={AppRoutes['ZORG/VOORZIENINGEN_LIST']}
              element={<ZorgRegelingen />}
            />
          )}

          <Route
            path={AppRoutes['BURGERZAKEN/LIST']}
            element={<BurgerZakenList />}
          />
          <Route
            path={AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS']}
            element={<BurgerzakenIdentiteitsbewijs />}
          />

          <Route
            path={AppRoutes['VERGUNNINGEN/LIST']}
            element={<VergunningenList />}
          />
          <Route
            path={AppRoutes['VERGUNNINGEN/DETAIL']}
            element={<VergunningDetailPagina />}
          />
          <Route
            path={AppRoutes.VERGUNNINGEN}
            element={<VergunningenThemaPagina />}
          />
          <Route
            path={AppRoutes['KLACHTEN/KLACHT']}
            element={<KlachtenDetailPagina />}
          />
          <Route
            path={AppRoutes['KLACHTEN/LIST']}
            element={<KlachtenLijstPagina />}
          />

          {FeatureToggle.bezwarenActive && (
            <Route
              path={AppRoutes['BEZWAREN/LIST']}
              element={<BezwarenLijstPagina />}
            />
          )}
          {FeatureToggle.bezwarenActive && (
            <Route
              path={AppRoutes['BEZWAREN/DETAIL']}
              element={<BezwarenDetailPagina />}
            />
          )}
          {FeatureToggle.bezwarenActive && (
            <Route
              path={AppRoutes.BEZWAREN}
              element={<BezwarenThemaPagina />}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/LIST']}
              element={<ToeristischeVerhuurVergunningen />}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']}
              element={<ToeristischeVerhuurDetailPagina />}
            />
          )}
          {FeatureToggle.toeristischeVerhuurActive && (
            <Route
              path={AppRoutes.TOERISTISCHE_VERHUUR}
              element={<ToeristscheVerhuurThema />}
            />
          )}

          {FeatureToggle.afisActive && (
            <Route
              path={AppRoutes['AFIS/BETAALVOORKEUREN']}
              element={<AfisBetaalVoorkeuren />}
            />
          )}
          {FeatureToggle.afisActive && (
            <Route
              path={AppRoutes['AFIS/FACTUREN']}
              element={<AfisFacturen />}
            />
          )}

          {FeatureToggle.horecaActive && (
            <Route
              path={AppRoutes['HORECA/LIST']}
              element={<HorecaLijstPagina />}
            />
          )}
          {FeatureToggle.horecaActive && (
            <Route
              path={AppRoutes['HORECA/DETAIL']}
              element={<HorecaDetailPagina />}
            />
          )}

          {FeatureToggle.bodemActive && (
            <Route
              path={AppRoutes['BODEM/LOOD_METING']}
              element={<LoodMeting />}
            />
          )}
          {FeatureToggle.contactmomentenActive && (
            <Route
              path={AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']}
              element={<ContactmomentenListPage />}
            />
          )}

          {FeatureToggle.erfpachtActive && (
            <Route
              path={AppRoutes['ERFPACHT/DOSSIERS']}
              element={<ErfpachtDossiers />}
            />
          )}
          {FeatureToggle.erfpachtActive && (
            <Route
              path={AppRoutes['ERFPACHT/ALLE_FACTUREN']}
              element={<ErfpachtFacturen />}
            />
          )}
          {FeatureToggle.erfpachtActive && (
            <Route
              path={AppRoutes['ERFPACHT/OPEN_FACTUREN']}
              element={<ErfpachtOpenFacturen />}
            />
          )}
          {FeatureToggle.erfpachtActive && (
            <Route
              path={AppRoutes['ERFPACHT/DOSSIERDETAIL']}
              element={<ErfpachtDossierDetail />}
            />
          )}

          <Route
            path={AppRoutes['PARKEREN/DETAIL']}
            element={<ParkerenDetailPagina />}
          />

          <Route element={<NotFound />} />
        </Routes>
      </Screen>
      {/** Remove the footer on the Map view for better UX */}
      {!isBuurt && <MainFooter isAuthenticated />}
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
