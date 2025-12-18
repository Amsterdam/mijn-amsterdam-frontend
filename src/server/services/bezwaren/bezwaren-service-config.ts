export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
  },
};

export const routes = {
  protected: {
    // Bezwaren
    BEZWAREN_DOCUMENT_DOWNLOAD: '/services/bezwaren/document',
    BEZWAREN_DETAIL: '/services/bezwaren/bezwaar',
  },
};

export const MAX_PAGE_COUNT = 10; // Should amount to 10 * 20 (per page) = 200 bezwaren
export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';
