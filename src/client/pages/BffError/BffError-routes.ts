import { BFF500Error } from './BffError';

export const BffErrorRoutes = [
  {
    route: '/server-error-500',
    Component: BFF500Error,
    public: true,
    private: true,
  },
];
