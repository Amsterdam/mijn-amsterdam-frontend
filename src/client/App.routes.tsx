import { Routes, Route, matchPath } from 'react-router';

import { MyAreaRoutes } from './components/MyArea/MyArea-routest';
import type { ThemaRenderRouteConfig } from './config/thema-types';
import { AccessibilityRoutes } from './pages/Accessibility/Accessibility-routes';
import { BffErrorRoutes } from './pages/BffError/BffError-routes';
import { DashboardRoutes } from './pages/Dashboard/Dashboard-routes';
import { GeneralInfoRoutes } from './pages/GeneralInfo/GeneralInfo-routes';
import { LandingRoutes } from './pages/Landing/Landing-routes';
import { MyNotificationsRoutes } from './pages/MyNotifications/MyNotifications-routes';
import { NotFoundRoutes } from './pages/NotFound/NotFound-routes';
import { SearchRoutes } from './pages/Search/Search-routes';
import { AfisRoutes } from './pages/Thema/Afis/Afis-render-config';
import { AfvalRoutes } from './pages/Thema/Afval/Afval-render-config';
import { AvgRoutes } from './pages/Thema/AVG/AVG-render-config';
import { BezwarenRoutes } from './pages/Thema/Bezwaren/Bezwaren-render-config';
import { BodemRoutes } from './pages/Thema/Bodem/Bodem-render-config';
import { BurgerzakenRoutes } from './pages/Thema/Burgerzaken/Burgerzaken-render-config';
import { ErfpachtRoutes } from './pages/Thema/Erfpacht/Erfpacht-render-config';
import { HLIRoutes } from './pages/Thema/HLI/HLI-render-config';
import { HorecaRoutes } from './pages/Thema/Horeca/Horeca-render-config';
import { InkomenRoutes } from './pages/Thema/Inkomen/Inkomen-render-config';
import { JeugdRoutes } from './pages/Thema/Jeugd/Jeugd-render-config';
import { KlachtenRoutes } from './pages/Thema/Klachten/Klachten-render-config';
import { KrefiaRoutes } from './pages/Thema/Krefia/Krefia-render-config';
import { ParkerenRoutes } from './pages/Thema/Parkeren/Parkeren-render-config';
import { ProfileRoutes } from './pages/Thema/Profile/Profile-render-config';
import { ToeristischeVerhuurRoutes } from './pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-routes';
import { VarenRoutes } from './pages/Thema/Varen/Varen-routes';
import { VergunningenRoutes } from './pages/Thema/Vergunningen/Vergunningen-routes';
import { ZorgRoutes } from './pages/Thema/Zorg/Zorg-routes';
import { ZaakStatusRoutes } from './pages/ZaakStatus/ZaakStatusRoutes';

export type ApplicationRouteConfig = ThemaRenderRouteConfig & {
  props?: {
    index?: boolean;
  };
  public?: boolean;
  private?: boolean;
};

const routeComponents: ApplicationRouteConfig[] = [
  AccessibilityRoutes,
  AfisRoutes,
  AfvalRoutes,
  AvgRoutes,
  BezwarenRoutes,
  BffErrorRoutes,
  BodemRoutes,
  BurgerzakenRoutes,
  DashboardRoutes,
  ErfpachtRoutes,
  GeneralInfoRoutes,
  HLIRoutes,
  JeugdRoutes,
  HorecaRoutes,
  InkomenRoutes,
  KlachtenRoutes,
  KrefiaRoutes,
  LandingRoutes,
  MyAreaRoutes,
  NotFoundRoutes,
  MyNotificationsRoutes,
  ParkerenRoutes,
  ProfileRoutes,
  SearchRoutes,
  ToeristischeVerhuurRoutes,
  VarenRoutes,
  VergunningenRoutes,
  ZaakStatusRoutes,
  ZorgRoutes,
].flat();

const privateRoutes = routeComponents.filter(
  (config) => config.private !== false
);

const publicRoutes = routeComponents.filter((config) => config.public === true);

function ApplicationRoutes({ routes }: { routes: ApplicationRouteConfig[] }) {
  return (
    <Routes>
      {routes
        .filter(({ isActive }) => isActive !== false)
        .map(({ route, Component, props }) => (
          <Route
            {...(props ? props : {})}
            key={route}
            path={route}
            element={<Component />}
          />
        ))}
    </Routes>
  );
}

export function PrivateRoutes() {
  return <ApplicationRoutes routes={privateRoutes} />;
}

export function PublicRoutes() {
  return <ApplicationRoutes routes={publicRoutes} />;
}

export function isPrivateRoute(pathname: string) {
  return privateRoutes.some(({ route }) => {
    const isMatched = !!matchPath(route, pathname);
    return isMatched;
  });
}
