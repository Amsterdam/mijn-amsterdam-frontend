import { NotFound, RedirectPrivateRoutesToLanding } from './NotFound';

export const NotFoundRoutes = [
  {
    route: '*',
    Component: NotFound,
    public: true,
  },
  {
    route: '*',
    Component: RedirectPrivateRoutesToLanding,
    public: true,
  },
];
