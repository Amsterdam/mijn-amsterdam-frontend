import { Dashboard } from './Dashboard';

export const DashboardRoutes = [
  {
    route: '/',
    Component: Dashboard,
    props: { index: true },
    public: false,
    private: true,
  },
];
