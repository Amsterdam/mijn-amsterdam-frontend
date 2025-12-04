import { IS_PRODUCTION } from '../../../universal/config/env';

export const featureToggle = {
  router: {
    protected: {
      isEnabled: !IS_PRODUCTION, // for now only enabled in non-prod environments
    },
  },
  service: {
    fetchAantalBewonersOpAdres: {
      isEnabled: !IS_PRODUCTION,
    },
  },
} as const;

export const routes = {
  protected: {
    BRP_PERSONEN_RAW: `/services/brp/personen/raw`,
    BRP_VERBLIJFPLAATSHISTORIE_RAW: `/services/brp/verblijfplaatshistorie/raw`,
    BRP_AANTAL_BEWONERS_OP_ADRES: '/service/brp/aantal-bewoners',
  },
} as const;

export const DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_FROM = '1900-01-01';
export const DEFAULT_VERBLIJFPLAATSHISTORIE_DATE_TO =
  new Date().getFullYear().toString() + '-12-31';
