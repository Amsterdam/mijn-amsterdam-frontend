import type { AanvragenApiConfig } from './zorgned-aanvragen-api-types.ts';

const STADSPAS_REGELING: AanvragenApiConfig = {
  include: {
    productsoortCode: 'AV-SPM',
    isActueel: true,
  },
  assign: {
    maActies: ['verlengen-stadspas'],
  },
};

export const hliAanvragenApiConfig: AanvragenApiConfig[] = [STADSPAS_REGELING];
