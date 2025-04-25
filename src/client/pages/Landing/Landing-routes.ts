import { LandingPage } from './Landing';

export const LandingRoute = {
  route: '/',
  Component: LandingPage,
  props: { index: true },
  public: true,
  private: false,
};

export const LandingRoutes = [LandingRoute];

export const DASHBOARD_PAGE_DOCUMENT_TITLE = 'Inloggen | Mijn Amsterdam';
