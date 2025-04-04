import { Routes, Route, Navigate, generatePath, matchPath } from 'react-router';

import { MyAreaRoutes } from './components/MyArea/MyArea-routest';
import { AccessibilityRoutes } from './pages/Accessibility/Accessibility-routes';
import { AfisRoutes } from './pages/Afis/Afis-routes';
import { AfvalRoutes } from './pages/Afval/Afval-routes';
import { AVGRoutes } from './pages/AVG/AVG-routes';
import { BezwarenRoutes } from './pages/Bezwaren/Bezwaren-routes';
import { BffErrorRoutes } from './pages/BffError/BffError-routes';
import { BodemRoutes } from './pages/Bodem/Bodem-routes';
import { BurgerzakenRoutes } from './pages/Burgerzaken/Burgerzaken-routes';
import { DashboardRoutes } from './pages/Dashboard/Dashboard-routes';
import { ErfpachtRoutes } from './pages/Erfpacht/Eerfpacht-routes';
import { GeneralInfoRoutes } from './pages/GeneralInfo/GeneralInfo-routes';
import { HLIRoutes } from './pages/HLI/HLI-routes';
import { HorecaRoutes } from './pages/Horeca/Horeca-routes';
import { InkomenRoutes } from './pages/Inkomen/Inkomen-routes';
import { KlachtenRoutes } from './pages/Klachten/Klachten-routes';
import { KrefiaRoutes } from './pages/Krefia/Krefia-routes';
import { LandingRoutes } from './pages/Landing/Landing-routes';
import { MyNotificationsRoutes } from './pages/MyNotifications/MyNotifications-routes';
import { NotFoundRoutes } from './pages/NotFound/NotFound-routes';
import { ParkerenRoutes } from './pages/Parkeren/Parkeren-routes';
import { ProfileRoutes } from './pages/Profile/Profile-routes';
import { SearchRoutes } from './pages/Search/Search-routes';
import { ToeristischeVerhuurRoutes } from './pages/ToeristischeVerhuur/ToeristischeVerhuur-routes';
import { VarenRoutes } from './pages/Varen/Varen-routes';
import { VergunningenRoutes } from './pages/Vergunningen/Vergunningen-routes';
import { ZaakStatusRoutes } from './pages/ZaakStatus/ZaakStatusRoutes';
import { ZorgRoutes } from './pages/Zorg/Zorg-routes';
import { AppRoutes } from '../universal/config/routes';
import { JeugdRoutes } from './pages/Jeugd/routes';

export const AppRoutesRedirect = [
  {
    from: '/burgerzaken/document/:id',
    to: AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS'],
  },
  {
    from: '/stadspas',
    to: AppRoutes.HLI,
  },
  {
    from: '/stadspas/saldo/:pasnummer',
    to: AppRoutes.HLI,
  },
  {
    from: '/inkomen-en-stadspas/bijstandsuitkering/:id',
    to: AppRoutes['INKOMEN/BIJSTANDSUITKERING'],
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'jaaropgave',
      page: null,
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'jaaropgave',
      page: null,
    }),
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'uitkering',
      page: null,
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'uitkering',
      page: null,
    }),
  },
  {
    from: '/inkomen-en-stadspas/tozo/:version/:id',
    to: AppRoutes['INKOMEN/TOZO'],
  },
  { from: '/inkomen-en-stadspas', to: AppRoutes.INKOMEN },
];

export type ApplicationRouteConfig = {
  route: string;
  Component: React.ComponentType;
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
  AVGRoutes,
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
  JeugdRoutes,
].flat();

const privateRoutes = routeComponents.filter(
  (config) => config.private !== false
);

const publicRoutes = routeComponents.filter((config) => config.public === true);

function ApplicationRoutes({ routes }: { routes: ApplicationRouteConfig[] }) {
  return (
    <Routes>
      {AppRoutesRedirect.map(({ from, to }) => (
        <Route
          key={from + to}
          path={from}
          element={<Navigate replace to={to} />}
        />
      ))}
      {routes.map(({ route, Component, props }) => (
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
