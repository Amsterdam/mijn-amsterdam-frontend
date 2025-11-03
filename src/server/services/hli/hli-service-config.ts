export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
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
