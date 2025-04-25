import { LandingPage } from './Landing';
import { AppRoutes } from '../../../universal/config/routes';

export const LandingRoutes = [
  {
    route: AppRoutes.HOME,
    Component: LandingPage,
    props: { index: true },
    public: true,
    private: false,
  },
];
