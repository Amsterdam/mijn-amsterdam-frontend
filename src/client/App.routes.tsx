import { Routes, Route, matchPath } from 'react-router';

import { MyAreaRoutes } from './components/MyArea/MyArea-routes.ts';
import type { ThemaRenderRouteConfig } from './config/thema-types.ts';
import { BffErrorRoutes } from './pages/BffError/BffError-routes.ts';
import { DashboardRoutes } from './pages/Dashboard/Dashboard-routes.ts';
import { GeneralInfoRoutes } from './pages/GeneralInfo/GeneralInfo-routes.ts';
import { LandingRoutes } from './pages/Landing/Landing-routes.ts';
import { MyNotificationsRoutes } from './pages/MyNotifications/MyNotifications-routes.ts';
import { NotFoundRoutes } from './pages/NotFound/NotFound-routes.ts';
import { SearchRoutes } from './pages/Search/Search-routes.ts';
import { AfisRoutes } from './pages/Thema/Afis/Afis-render-config.tsx';
import { AfvalRoutes } from './pages/Thema/Afval/Afval-render-config.tsx';
import { AvgRoutes } from './pages/Thema/AVG/AVG-render-config.tsx';
import { BezwarenRoutes } from './pages/Thema/Bezwaren/Bezwaren-render-config.tsx';
import { BodemRoutes } from './pages/Thema/Bodem/Bodem-render-config.tsx';
import { BurgerzakenRoutes } from './pages/Thema/Burgerzaken/Burgerzaken-render-config.tsx';
import { ErfpachtRoutes } from './pages/Thema/Erfpacht/Erfpacht-render-config.tsx';
import { HLIRoutes } from './pages/Thema/HLI/HLI-render-config.tsx';
import { HorecaRoutes } from './pages/Thema/Horeca/Horeca-render-config.tsx';
import { InkomenRoutes } from './pages/Thema/Inkomen/Inkomen-render-config.tsx';
import { JeugdRoutes } from './pages/Thema/Jeugd/Jeugd-render-config.tsx';
import { KlachtenRoutes } from './pages/Thema/Klachten/Klachten-render-config.tsx';
import { KrefiaRoutes } from './pages/Thema/Krefia/Krefia-render-config.tsx';
import { ParkerenRoutes } from './pages/Thema/Parkeren/Parkeren-render-config.tsx';
import { ProfileRoutes } from './pages/Thema/Profile/Profile-render-config.tsx';
import { ToeristischeVerhuurRoutes } from './pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-render-config.tsx';
import { VarenRoutes } from './pages/Thema/Varen/Varen-render-config.tsx';
import { VergunningenRoutes } from './pages/Thema/Vergunningen/Vergunningen-render-config.tsx';
import { ZorgRoutes } from './pages/Thema/Zorg/Zorg-render-config.tsx';
import { ZaakStatusRoutes } from './pages/ZaakStatus/ZaakStatus-routes.ts';

export type ApplicationRouteConfig = ThemaRenderRouteConfig & {
  props?: {
    index?: boolean;
  };
  public?: boolean;
  private?: boolean;
};

const routeComponents: ApplicationRouteConfig[] = [
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
  HorecaRoutes,
  InkomenRoutes,
  JeugdRoutes,
  KlachtenRoutes,
  KrefiaRoutes,
  LandingRoutes,
  MyAreaRoutes,
  MyNotificationsRoutes,
  NotFoundRoutes,
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
