import { BFF500Error } from './BffError';

export const BffErrorRoutes = [
  {
    route: '/server-error-500',
    Component: BFF500Error,
    public: true,
    private: true,
  },
];

export const BFF500_PAGE_DOCUMENT_TITLE = '500 Server Error | Mijn Amsterdam';
