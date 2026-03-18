import { NotFound, RedirectPrivateRoutesToLanding } from './NotFound.tsx';

export const NotFoundRoutes = [
  {
    route: '*',
    Component: NotFound,
    public: false,
    private: true,
  },
  {
    route: '*',
    Component: RedirectPrivateRoutesToLanding,
    public: true,
    private: false,
  },
];
