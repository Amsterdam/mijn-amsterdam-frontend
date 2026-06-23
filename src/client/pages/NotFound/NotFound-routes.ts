import { NotFound } from './NotFound.tsx';
import { RedirectPrivateRoutesToLanding } from './Redirect.tsx';

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
