export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
  },
  service: {
    fetchAantalIngeschrevenPersonenOpAdres: {
      isEnabled: true,
    },
  },
} as const;

export const routes = {
  protected: {
    BRP_PERSONEN_RAW: `/services/brp/personen/raw`,
    BRP_VERBLIJFPLAATSHISTORIE_RAW: `/services/brp/verblijfplaatshistorie/raw`,
    BRP_AANTAL_INGESCHREVEN_PERSONEN_OP_ADRES:
      '/services/brp/aantal-ingeschreven-personen',
  },
} as const;

export const DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM = '1900-01-01';
export const DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO =
  new Date().getFullYear().toString() + '-12-31';
