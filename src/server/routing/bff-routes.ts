export const BFF_BASE_PATH = '/api/v1';
export const BFF_BASE_PATH_PRIVATE = '/private/api/v1';
export const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? BFF_BASE_PATH;

export const BffEndpoints = {
  ROOT: '/',
  SERVICES_ALL: '/services/all',
  SERVICES_TIPS: '/services/tips',
  SERVICES_STREAM: '/services/stream',
  MAP_DATASETS: '/map/datasets/:datasetId?/:id?',
  SEARCH_CONFIG: '/services/search-config',
  CMS_CONTENT: '/services/cms',
  FOOTER: '/services/footer',
  CMS_MAINTENANCE_NOTIFICATIONS: '/services/cms/maintenance-notifications',
  CACHE_OVERVIEW: '/admin/cache',
  LOGIN_STATS: '/admin/visitors/:authMethod?',
  LOGIN_RAW: '/admin/visitors/table',
  SESSION_BLACKLIST_RAW: '/admin/session-blacklist/table',
  STATUS_HEALTH: '/status/health',
  TEST_ACCOUNTS_OVERVIEW: '/admin/user-data-overview',

  TELEMETRY_PROXY: '/services/telemetry/v2/track',

  // AFIS
  AFIS_BUSINESSPARTNER:
    '/services/afis/businesspartner/:businessPartnerIdEncrypted',

  // Stadspas
  STADSPAS_TRANSACTIONS:
    '/services/stadspas/transactions/:transactionsKeyEncrypted?',

  // Vergunningen V2
  VERGUNNINGENv2_ZAKEN_SOURCE: '/services/vergunningen/v2/zaken/:id?',
  VERGUNNINGENv2_DETAIL: `/services/vergunningen/v2/:id`,
  VERGUNNINGENv2_DOCUMENT_DOWNLOAD:
    '/services/vergunningen/v2/documents/download/:id',

  // Vergunningen / Koppel api
  VERGUNNINGEN_DOCUMENT_DOWNLOAD:
    '/services/vergunningen/documents/download/:id',
  VERGUNNINGEN_LIST_DOCUMENTS: '/services/vergunningen/documents/list/:id',

  // MKS bewoners
  MKS_AANTAL_BEWONERS: '/service/mks/aantal-bewoners/:addressKeyEncrypted',

  // WPI Document download
  WPI_DOCUMENT_DOWNLOAD: '/services/wpi/document/:id',

  // WMO / Zorgned
  WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document/:id`,

  // AV / Zorgned
  HLI_DOCUMENT_DOWNLOAD: `/services/v1/stadspas-en-andere-regelingen/document/:id`,

  // Legacy login links (still used in other portals)
  LEGACY_LOGIN_API_LOGIN: '/api/login',
  LEGACY_LOGIN_API1_LOGIN: '/api1/login',

  // Bezwaren
  BEZWAREN_DOCUMENT_DOWNLOAD: '/services/bezwaren/document/:id',
  BEZWAREN_DETAIL: '/services/bezwaren/:id',

  // ErfpachtV2
  ERFPACHTv2_DOSSIER_DETAILS:
    '/services/erfpachtv2/dossier/:dossierNummerUrlParam?',

  // Toeristische verhuur / Bed & Breakfast
  TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD:
    '/services/toeristische-verhuur/bb/document/:id',

  // Bodem / loodmetingen
  LOODMETING_DOCUMENT_DOWNLOAD: '/services/lood/document/:id',
};

export const ExternalConsumerEndpoints = {
  // Publicly accessible
  public: {
    STADSPAS_AMSAPP_LOGIN: `/services/amsapp/stadspas/login/:token`,
    STADSPAS_ADMINISTRATIENUMMER: `/services/amsapp/stadspas/administratienummer/:token`,
  },
  // Privately accessible
  private: {
    STADSPAS_PASSEN: `${BFF_BASE_PATH_PRIVATE}/services/amsapp/stadspas/passen/:administratienummerEncrypted`,
    STADSPAS_DISCOUNT_TRANSACTIONS: `${BFF_BASE_PATH_PRIVATE}/services/amsapp/stadspas/aanbiedingen/transactions/:transactionsKeyEncrypted`,
    STADSPAS_BUDGET_TRANSACTIONS: `${BFF_BASE_PATH_PRIVATE}/services/amsapp/stadspas/budget/transactions/:transactionsKeyEncrypted`,
  },
};

// Accessible without authentication
export const PUBLIC_BFF_ENDPOINTS: string[] = [
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  BffEndpoints.STATUS_HEALTH,
  BffEndpoints.CMS_CONTENT,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.FOOTER,
  BffEndpoints.TELEMETRY_PROXY,
];
