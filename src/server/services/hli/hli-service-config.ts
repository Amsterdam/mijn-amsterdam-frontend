export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
  },
  service: {
    enabledStadspas: true,
    enabledRegelingen: true,
    enabledRTM: true,
    enabledAV: true,
  },
};

export const routes = {
  protected: {
    // Stadspas
    STADSPAS_TRANSACTIONS:
      '/services/stadspas/transactions/:transactionsKeyEncrypted',
    STADSPAS_BLOCK_PASS: '/services/stadspas/block/:transactionsKeyEncrypted',
    STADSPAS_UNBLOCK_PASS:
      '/services/stadspas/unblock/:transactionsKeyEncrypted',

    // AV / Zorgned
    HLI_DOCUMENT_DOWNLOAD: `/services/v1/stadspas-en-andere-regelingen/document`,
    HLI_AANVRAGEN_RAW: `/services/hli/raw/aanvragen`,
  },
};

export const ZORGNED_AV_API_CONFIG_KEY = 'ZORGNED_AV';
