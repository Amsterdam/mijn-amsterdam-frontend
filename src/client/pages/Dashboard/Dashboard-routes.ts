import { Dashboard } from './Dashboard';
import { themaTitle, themaId } from './Dashboard-config';

export const DashboardRoute = {
  route: '/',
  Component: Dashboard,
  props: { index: true },
  public: false,
  private: true,
};

export const DashboardRoutes = [DashboardRoute];

export const dashboardMenuItem = {
  title: themaTitle,
  id: themaId,
  to: DashboardRoute.route,
};
