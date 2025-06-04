export const BFF_BASE_PATH = '/api/v1';
export const BFF_BASE_PATH_PRIVATE = '/private/api/v1';

export const BffEndpoints = {
  ROOT: '/',
  ZAAK_STATUS: '/services/zaak-status',
  SERVICES_ALL: '/services/all',
  SERVICES_TIPS: '/services/tips',
  SERVICES_STREAM: '/services/stream',
  MAP_DATASETS: '/map/datasets/:datasetId?/:id?',
  SEARCH_CONFIG: '/services/search-config',
  CMS_FOOTER: '/services/cms/footer',
  CMS_MAINTENANCE_NOTIFICATIONS: '/services/cms/maintenance-notifications',
  CACHE_OVERVIEW: '/admin/cache',
  LOGIN_STATS: '/admin/visitors/:authMethod?',
  LOGIN_RAW: '/admin/visitors/table',
  STATUS_HEALTH: '/status/health',
  TEST_ACCOUNTS_OVERVIEW: '/admin/user-data-overview',

  TELEMETRY_PROXY: '/services/telemetry/v2/track',

  // AFIS
  AFIS_BUSINESSPARTNER: '/services/afis/businesspartner',
  AFIS_FACTUREN:
    '/services/afis/facturen/:state(open|afgehandeld|overgedragen)',
  AFIS_DOCUMENT_DOWNLOAD: '/services/afis/facturen/document',

  // Stadspas
  STADSPAS_TRANSACTIONS:
    '/services/stadspas/transactions/:transactionsKeyEncrypted?',
  STADSPAS_BLOCK_PASS: '/services/stadspas/block/:transactionsKeyEncrypted',
  STADSPAS_UNBLOCK_PASS: '/services/stadspas/unblock/:transactionsKeyEncrypted',

  // Decos (Vergunningen, Horeca, Parkeren en Toeristische verhuur)
  DECOS_DOCUMENTS_LIST: `/services/decos/documents`,
  DECOS_DOCUMENT_DOWNLOAD: '/services/decos/documents/download',
  DECOS_ZAKEN_BY_USERIDS_RAW: '/services/decos/zaken-raw',
  DECOS_ZAAK_BY_KEY_RAW: '/services/decos/zaak-raw',
  DECOS_WORKFLOW_BY_KEY_RAW: '/services/decos/zaak-workflows-raw',

  // MKS bewoners
  MKS_AANTAL_BEWONERS: '/service/mks/aantal-bewoners/:addressKeyEncrypted',

  // WPI Document download
  WPI_DOCUMENT_DOWNLOAD: '/services/wpi/document/:id',

  // WMO / Zorgned
  WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document/:id`,

  // AV / Zorgned
  HLI_DOCUMENT_DOWNLOAD: `/services/v1/stadspas-en-andere-regelingen/document/:id`,

  // LLV / Zorgned
  LLV_DOCUMENT_DOWNLOAD: `/services/llv/document/:id`,

  // Legacy login links (still used in other portals)
  LEGACY_LOGIN_API_LOGIN: '/api/login',
  LEGACY_LOGIN_API1_LOGIN: '/api1/login',

  // Bezwaren
  BEZWAREN_DOCUMENT_DOWNLOAD: '/services/bezwaren/document',
  BEZWAREN_DETAIL: '/services/bezwaren',

  // ErfpachtV2
  ERFPACHT_DOSSIER_DETAILS:
    '/services/erfpacht/dossier/:dossierNummerUrlParam?',

  // Toeristische verhuur / Bed & Breakfast
  TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD:
    '/services/toeristische-verhuur/bed-and-breakfast/document',
  TOERISTISCHE_VERHUUR_BB_DOCUMENT_LIST:
    '/services/toeristische-verhuur/bed-and-breakfast/documents/list',

  // Bodem / loodmetingen
  LOODMETING_DOCUMENT_DOWNLOAD: '/services/lood/document/:id',
} as const;

const AMSAPP_BASE = '/services/amsapp';

export const ExternalConsumerEndpoints = {
  // Publicly accessible
  public: {
    STADSPAS_AMSAPP_LOGIN: `${AMSAPP_BASE}/stadspas/login/:token`,
    STADSPAS_ADMINISTRATIENUMMER: `${AMSAPP_BASE}/stadspas/administratienummer/:token`,
    STADSPAS_APP_LANDING: `${AMSAPP_BASE}/stadspas/app-landing`,
  },
  // Privately accessible
  private: {
    STADSPAS_PASSEN: `${BFF_BASE_PATH_PRIVATE}${AMSAPP_BASE}/stadspas/passen/:administratienummerEncrypted`,
    STADSPAS_DISCOUNT_TRANSACTIONS: `${BFF_BASE_PATH_PRIVATE}${AMSAPP_BASE}/stadspas/aanbiedingen/transactions/:transactionsKeyEncrypted`,
    STADSPAS_BUDGET_TRANSACTIONS: `${BFF_BASE_PATH_PRIVATE}${AMSAPP_BASE}/stadspas/budget/transactions/:transactionsKeyEncrypted`,
    STADSPAS_BLOCK_PAS: `${BFF_BASE_PATH_PRIVATE}${AMSAPP_BASE}/stadspas/block/:transactionsKeyEncrypted`,
  },
} as const;

// Accessible without authentication
export const PUBLIC_BFF_ENDPOINTS = [
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  BffEndpoints.STATUS_HEALTH,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.CMS_FOOTER,
  BffEndpoints.TELEMETRY_PROXY,
] as const;

export const DevelopmentRoutes = {
  DEV_LOGIN: '/api/v1/auth/:authMethod/login/:user?',
} as const;

export const PREDEFINED_REDIRECT_URLS = [
  'noredirect',
  '/api/v1/services/all',
] as const;
